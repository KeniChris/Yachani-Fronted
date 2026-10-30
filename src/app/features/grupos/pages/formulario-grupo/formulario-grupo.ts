import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppLayout } from '../../../../layouts/app-layout/app-layout';
import { GruposStore } from '../../grupos.store';
import { DatosGrupo, DiaSemana, GrupoEstudio } from '../../grupos.models';
import { formatearHorario, rutaGrupo } from '../../grupos.formato';
import { CAPACIDAD_MAXIMA, CAPACIDAD_MINIMA, DIAS_SEMANA, ICONOS_GRUPO, MAX_TEMAS_INICIALES, METODOS_ESTUDIO, MODALIDADES_GRUPO } from '../../grupos.opciones';

const horarioValido: ValidatorFn = (form: AbstractControl) => {
  const inicio = form.get('horaInicio')?.value;
  const fin = form.get('horaFin')?.value;
  return inicio && fin && fin <= inicio ? { horario: true } : null;
};

@Component({
  selector: 'app-formulario-grupo',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './formulario-grupo.html',
  styleUrls: ['../../grupos.css', './formulario-grupo.css'],
})
export class FormularioGrupo {
  readonly store = inject(GruposStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly alerta = viewChild<ElementRef<HTMLElement>>('alerta');

  readonly esEdicion = this.route.snapshot.data['modo'] === 'editar';
  readonly grupoId = this.route.snapshot.paramMap.get('grupoId') ?? '';
  readonly grupoOriginal: GrupoEstudio | null = this.esEdicion ? this.store.grupo(this.grupoId) : null;
  // Solo el tutor del grupo puede editarlo.
  readonly sinPermiso = this.esEdicion && (!this.grupoOriginal || this.grupoOriginal.tutorId !== this.store.usuarioActualId('tutor'));
  readonly borrador = this.esEdicion ? null : this.store.borradorGrupo();
  readonly integrantesActuales = this.esEdicion ? this.store.integrantesDe(this.grupoId).length : 1;
  readonly capacidadMinima = Math.max(CAPACIDAD_MINIMA, this.integrantesActuales);

  readonly metodos = METODOS_ESTUDIO;
  readonly modalidades = MODALIDADES_GRUPO;
  readonly dias = DIAS_SEMANA;
  readonly iconos = ICONOS_GRUPO;
  readonly capacidadMaxima = CAPACIDAD_MAXIMA;
  readonly maxTemas = MAX_TEMAS_INICIALES;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    curso: ['', [Validators.required, Validators.maxLength(60)]],
    tema: ['', [Validators.required, Validators.maxLength(80)]],
    descripcion: ['', Validators.maxLength(300)],
    icono: ['menu_book'],
    metodo: ['', Validators.required],
    modalidad: ['Virtual', Validators.required],
    capacidadMaxima: [6, [Validators.required, Validators.min(this.capacidadMinima), Validators.max(CAPACIDAD_MAXIMA)]],
    dias: [[] as DiaSemana[], Validators.required],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required],
  }, { validators: horarioValido });
  readonly temas = signal<string[]>([]);
  readonly nuevoTema = new FormControl('', { nonNullable: true });
  readonly errorTema = signal('');
  readonly intentoGuardar = signal(false);
  readonly mensajeEdicion = signal('');
  readonly creado = signal<GrupoEstudio | null>(null);

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly vista = computed(() => {
    const valores = { ...this.form.getRawValue(), ...this.valores() };
    return { ...valores, horario: formatearHorario(this.horario(valores.dias ?? [], valores.horaInicio ?? '', valores.horaFin ?? '')) };
  });

  constructor() {
    const inicial = this.grupoOriginal ?? this.borrador?.datos;
    if (inicial) {
      this.form.reset({
        nombre: inicial.nombre, curso: inicial.curso, tema: inicial.tema, descripcion: inicial.descripcion, icono: inicial.icono,
        metodo: inicial.metodo, modalidad: inicial.modalidad, capacidadMaxima: inicial.capacidadMaxima,
        dias: inicial.horario?.dias ?? [], horaInicio: inicial.horario?.inicio ?? '', horaFin: inicial.horario?.fin ?? '',
      });
    }
    if (this.borrador) this.temas.set(this.borrador.temas.slice(0, MAX_TEMAS_INICIALES));
    // El borrador se usa una sola vez.
    this.store.borradorGrupo.set(null);

    const layout = inject(AppLayout, { optional: true });
    if (this.store.modoPrevisualizacion && layout) {
      afterNextRender(() => layout.nombrePrevisualizacion.set(this.store.nombreUsuario('tutor')));
      inject(DestroyRef).onDestroy(() => layout.nombrePrevisualizacion.set(''));
    }
  }

  get rutaVolver(): string { return this.esEdicion && this.grupoOriginal ? rutaGrupo('tutor', this.grupoId) : '/app/tutor/grupos'; }
  rutaGrupo(grupo: GrupoEstudio): string { return rutaGrupo('tutor', grupo.id); }

  diaSeleccionado(dia: DiaSemana): boolean { return this.form.controls.dias.value.includes(dia); }

  alternarDia(dia: DiaSemana): void {
    const control = this.form.controls.dias;
    const seleccion = control.value.includes(dia) ? control.value.filter(item => item !== dia) : [...control.value, dia];
    control.setValue(DIAS_SEMANA.map(item => item.valor).filter(valor => seleccion.includes(valor)));
    control.markAsTouched();
  }

  cambiarCapacidad(delta: number): void {
    const control = this.form.controls.capacidadMaxima;
    control.setValue(Math.min(CAPACIDAD_MAXIMA, Math.max(1, (Number(control.value) || 0) + delta)));
    control.markAsTouched();
  }

  agregarTema(): void {
    const nombre = this.nuevoTema.value.trim();
    if (!nombre) return;
    if (this.temas().some(tema => tema.toLowerCase() === nombre.toLowerCase())) { this.errorTema.set('Ese tema ya está en la lista.'); return; }
    if (this.temas().length >= MAX_TEMAS_INICIALES) { this.errorTema.set(`Puedes agregar hasta ${MAX_TEMAS_INICIALES} temas al crear el grupo.`); return; }
    this.temas.update(lista => [...lista, nombre.slice(0, 80)]);
    this.nuevoTema.reset();
    this.errorTema.set('');
  }

  agregarTemaConEnter(evento: Event): void {
    evento.preventDefault();
    this.agregarTema();
  }

  quitarTema(nombre: string): void { this.temas.update(lista => lista.filter(tema => tema !== nombre)); }

  guardar(): void {
    this.form.markAllAsTouched();
    this.intentoGuardar.set(true);
    if (this.form.invalid) {
      setTimeout(() => this.alerta()?.nativeElement.focus());
      return;
    }
    const valores = this.form.getRawValue();
    const datos: DatosGrupo = {
      nombre: valores.nombre.trim(), curso: valores.curso.trim(), tema: valores.tema.trim(), descripcion: valores.descripcion.trim(),
      icono: valores.icono, metodo: valores.metodo, modalidad: valores.modalidad, capacidadMaxima: Number(valores.capacidadMaxima),
      horario: this.horario(valores.dias, valores.horaInicio, valores.horaFin),
    };
    // Pendiente: enviar al backend y usar el grupo que devuelva.
    if (this.esEdicion) {
      const error = this.store.editarGrupo(this.grupoId, datos);
      if (error) { this.form.controls.capacidadMaxima.setErrors({ min: true }); return; }
      this.intentoGuardar.set(false);
      this.mensajeEdicion.set('Cambios guardados. Los integrantes verán la información actualizada.');
      this.form.markAsPristine();
    } else {
      this.creado.set(this.store.crearGrupo(datos, this.temas()));
    }
  }

  private horario(dias: DiaSemana[], inicio: string, fin: string) {
    return dias.length && inicio && fin ? { dias, inicio, fin } : null;
  }
}
