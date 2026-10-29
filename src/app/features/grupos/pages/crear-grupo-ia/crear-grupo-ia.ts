import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { AppLayout } from '../../../../layouts/app-layout/app-layout';
import { GruposStore } from '../../grupos.store';
import { DiaSemana, GrupoEstudio } from '../../grupos.models';
import { formatearHorario, rutaGrupo } from '../../grupos.formato';
import { DIAS_SEMANA, MAX_TEMAS_INICIALES, METODOS_ESTUDIO, MODALIDADES_GRUPO } from '../../grupos.opciones';
import { FranjaDisponible, PropuestaGrupo, SolicitudPropuesta, TAMANOS, TamanoGrupo, generarPropuesta } from './propuesta-ia';

type Paso = 'formulario' | 'generando' | 'franja-invalida' | 'propuesta' | 'creado';
const MAX_FRANJAS = 5;
const PASOS_GENERACION = ['Objetivo de aprendizaje revisado', 'Temas organizados por dificultad', 'Comparando horarios y cupos', 'Preparando tu propuesta'];

@Component({
  selector: 'app-crear-grupo-ia',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule],
  templateUrl: './crear-grupo-ia.html',
  styleUrls: ['../../grupos.css', './crear-grupo-ia.css', './crear-grupo-ia-estados.css'],
})
export class CrearGrupoIa {
  readonly store = inject(GruposStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly titulo = viewChild<ElementRef<HTMLElement>>('titulo');
  private temporizadores: ReturnType<typeof setTimeout>[] = [];

  readonly metodos = METODOS_ESTUDIO;
  readonly modalidades = MODALIDADES_GRUPO;
  readonly dias = DIAS_SEMANA;
  readonly tamanos = TAMANOS;
  readonly pasosGeneracion = PASOS_GENERACION;
  readonly maxFranjas = MAX_FRANJAS;

  readonly form = this.fb.nonNullable.group({
    curso: ['', [Validators.required, Validators.maxLength(60)]],
    objetivo: ['', [Validators.required, Validators.maxLength(200)]],
    metodo: [''],
    modalidad: ['Virtual'],
    tamano: ['mediano' as TamanoGrupo],
  });
  readonly franjas = signal<FranjaDisponible[]>([{ dia: 'lunes', inicio: '18:00', fin: '20:00' }]);
  readonly franjaInvalida = signal<number | null>(null);
  readonly paso = signal<Paso>('formulario');
  readonly progreso = signal(0);
  readonly propuesta = signal<PropuestaGrupo | null>(null);
  readonly variante = signal(0);
  readonly nuevoTema = new FormControl('', { nonNullable: true });
  readonly creado = signal<GrupoEstudio | null>(null);
  private solicitud: SolicitudPropuesta | null = null;

  readonly formatearHorario = formatearHorario;

  constructor() {
    const layout = inject(AppLayout, { optional: true });
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.detenerGeneracion());
    if (this.store.modoPrevisualizacion && layout) {
      afterNextRender(() => layout.nombrePrevisualizacion.set(this.store.nombreUsuario('tutor')));
      destroyRef.onDestroy(() => layout.nombrePrevisualizacion.set(''));
    }
  }

  etiquetaDia(dia: DiaSemana): string { return DIAS_SEMANA.find(item => item.valor === dia)?.etiqueta ?? dia; }
  tamanoEtiqueta(valor: TamanoGrupo): string { const t = TAMANOS.find(item => item.valor === valor); return t ? `${t.etiqueta} integrantes` : ''; }

  actualizarFranja(indice: number, campo: keyof FranjaDisponible, evento: Event | string): void {
    const valor = typeof evento === 'string' ? evento : (evento.target as HTMLInputElement).value;
    this.franjas.update(lista => lista.map((franja, i) => i === indice ? { ...franja, [campo]: valor } : franja));
    if (this.franjaInvalida() === indice) this.franjaInvalida.set(null);
  }

  agregarFranja(): void {
    if (this.franjas().length >= MAX_FRANJAS) return;
    const usados = new Set(this.franjas().map(franja => franja.dia));
    const dia = DIAS_SEMANA.find(item => !usados.has(item.valor))?.valor ?? 'lunes';
    this.franjas.update(lista => [...lista, { dia, inicio: '18:00', fin: '20:00' }]);
  }

  quitarFranja(indice: number): void {
    this.franjas.update(lista => lista.filter((_, i) => i !== indice));
    this.franjaInvalida.set(null);
  }

  generar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.franjas().length) return;
    const invalida = this.franjas().findIndex(franja => !franja.inicio || !franja.fin || franja.fin <= franja.inicio);
    if (invalida >= 0) {
      this.franjaInvalida.set(invalida);
      this.irAPaso('franja-invalida');
      return;
    }
    this.solicitud = { ...this.form.getRawValue(), franjas: this.franjas() };
    this.variante.set(0);
    this.iniciarGeneracion();
  }

  otraPropuesta(): void {
    if (!this.solicitud) return;
    this.variante.update(valor => valor + 1);
    this.iniciarGeneracion();
  }

  cancelarGeneracion(): void {
    this.detenerGeneracion();
    this.irAPaso('formulario');
  }

  corregirDisponibilidad(): void { this.irAPaso('formulario'); }
  ajustarDatos(): void { this.irAPaso('formulario'); }

  editarCampo(campo: 'nombre' | 'descripcion', evento: Event): void {
    const valor = (evento.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.propuesta.update(actual => actual && { ...actual, datos: { ...actual.datos, [campo]: valor } });
  }

  quitarTema(tema: string): void {
    this.propuesta.update(actual => actual && { ...actual, temas: actual.temas.filter(item => item !== tema) });
  }

  agregarTema(evento?: Event): void {
    evento?.preventDefault();
    const nombre = this.nuevoTema.value.trim();
    const actual = this.propuesta();
    if (!nombre || !actual || actual.temas.length >= MAX_TEMAS_INICIALES || actual.temas.includes(nombre)) return;
    this.propuesta.set({ ...actual, temas: [...actual.temas, nombre.slice(0, 80)] });
    this.nuevoTema.reset();
  }

  propuestaValida(): boolean {
    const datos = this.propuesta()?.datos;
    return !!datos?.nombre.trim() && datos.nombre.length <= 60 && datos.descripcion.length <= 300;
  }

  // Revisión: el tutor puede abrir la propuesta en el formulario completo antes de crear.
  revisarEnFormulario(): void {
    const actual = this.propuesta();
    if (!actual) return;
    this.store.borradorGrupo.set({ datos: { ...actual.datos, nombre: actual.datos.nombre.trim() }, temas: actual.temas, origen: 'ia' });
    this.router.navigateByUrl('/app/tutor/crear-grupo');
  }

  crear(): void {
    const actual = this.propuesta();
    if (!actual || !this.propuestaValida()) return;
    // Pendiente: crear el grupo en el backend con la propuesta aceptada.
    this.creado.set(this.store.crearGrupo({ ...actual.datos, nombre: actual.datos.nombre.trim(), descripcion: actual.datos.descripcion.trim() }, actual.temas));
    this.irAPaso('creado');
  }

  rutaGrupo(grupo: GrupoEstudio, pestana?: string): string { return rutaGrupo('tutor', grupo.id, pestana); }

  private iniciarGeneracion(): void {
    this.detenerGeneracion();
    this.progreso.set(0);
    this.irAPaso('generando');
    // Pendiente: el avance real lo informará el servicio de IA.
    PASOS_GENERACION.forEach((_, i) => this.temporizadores.push(setTimeout(() => this.progreso.set(i + 1), 650 * (i + 1))));
    this.temporizadores.push(setTimeout(() => {
      if (!this.solicitud) return;
      this.propuesta.set(generarPropuesta(this.solicitud, this.variante()));
      this.irAPaso('propuesta');
    }, 650 * (PASOS_GENERACION.length + 1)));
  }

  private detenerGeneracion(): void {
    this.temporizadores.forEach(clearTimeout);
    this.temporizadores = [];
  }

  private irAPaso(paso: Paso): void {
    this.paso.set(paso);
    setTimeout(() => this.titulo()?.nativeElement.focus());
  }
}
