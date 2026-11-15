import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  TemplateRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { finalize, Subscription } from 'rxjs';
import { AvisoRequest, AvisoResponse } from '../../../core/models/aviso.models';
import { AvisoService } from '../../../core/services/aviso.service';
import { crearAvisoTemporal } from '../../../core/services/aviso-temporal';
import { ContextoGrupoService } from '../../../core/services/contexto-grupo.service';
import { errorApi, textoRequerido } from '../../../core/services/recursos-ui';
import { AvisoOperacion } from '../../../shared/aviso-operacion/aviso-operacion';

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    AvisoOperacion,
  ],
  templateUrl: './avisos.html',
  styleUrls: ['../grupos.css', './avisos.css'],
})
export class Avisos {
  private readonly contexto = inject(ContextoGrupoService);
  private readonly api = inject(AvisoService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private carga?: Subscription;
  private dialogo?: MatDialogRef<unknown>;

  readonly lista = signal<AvisoResponse[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly guardando = signal(false);
  readonly errorAccion = signal('');
  readonly aviso = crearAvisoTemporal();

  readonly puedeGestionar = computed(
    () =>
      this.contexto.usuario()?.tipoUsuario === 'TUTOR' &&
      this.contexto.administrador() &&
      this.contexto.grupo()?.estado === 'ACTIVO',
  );

  readonly form = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [textoRequerido, Validators.maxLength(100)],
    }),
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [textoRequerido, Validators.maxLength(500)],
    }),
  });

  constructor() {
    effect(() => {
      const idGrupo = this.contexto.idGrupo();
      const puedeConsultar = this.contexto.miembro() && !this.contexto.cargando();
      untracked(() => {
        this.dialogo?.close();
        this.aviso.ocultar();
        this.cargar(puedeConsultar ? idGrupo : null);
      });
    });
    this.destroyRef.onDestroy(() => this.dialogo?.close());
  }

  cargar(idGrupo = this.contexto.idGrupo()): void {
    this.carga?.unsubscribe();
    this.lista.set([]);
    this.error.set('');

    if (idGrupo === null) {
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.carga = this.api
      .listarAvisos(idGrupo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (lista) => this.lista.set(lista),
        error: (e) => this.error.set(errorApi(e)),
      });
  }

  abrir(template: TemplateRef<unknown>, avisoActual: AvisoResponse | null = null): void {
    if (!this.puedeGestionar() || this.guardando() || this.dialogo) return;

    this.errorAccion.set('');
    this.form.reset({
      titulo: avisoActual?.titulo ?? '',
      mensaje: avisoActual?.mensaje ?? '',
    });

    const ref = this.dialog.open(template, {
      width: '600px',
      maxWidth: 'calc(100vw - 32px)',
      data: avisoActual,
      ariaLabel: avisoActual ? 'Editar aviso' : 'Publicar aviso',
    });
    this.dialogo = ref;
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.dialogo = undefined;
    });
  }

  guardar(avisoActual: AvisoResponse | null, ref: MatDialogRef<unknown>): void {
    const idGrupo = this.contexto.idGrupo();
    if (idGrupo === null || !this.puedeGestionar() || this.guardando()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorAccion.set('Llene correctamente los campos requeridos');
      return;
    }

    const { titulo, mensaje } = this.form.getRawValue();
    const datos: AvisoRequest = { titulo: titulo.trim(), mensaje: mensaje.trim() };
    this.errorAccion.set('');
    this.guardando.set(true);
    ref.disableClose = true;

    const solicitud = avisoActual
      ? this.api.editarAviso(idGrupo, avisoActual.idAviso, datos)
      : this.api.publicarAviso(idGrupo, datos);

    solicitud
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.guardando.set(false);
          ref.disableClose = false;
        }),
      )
      .subscribe({
        next: () => {
          if (this.contexto.idGrupo() !== idGrupo) return;
          this.cargar(idGrupo);
          this.aviso.mostrar(avisoActual ? 'editado' : 'publicado');
          ref.close();
        },
        error: (e) => this.errorAccion.set(errorApi(e)),
      });
  }
}