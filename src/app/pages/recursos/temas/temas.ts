import {
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  TemplateRef,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ContextoGrupoService } from '../../../core/services/contexto-grupo.service';
import { RecursosApiService } from '../../../core/services/recursos-api.service';
import { errorApi, textoRequerido } from '../../../core/services/recursos-ui';
import { TemaResponse } from '../../../core/models/recursos.models';
import { SeleccionarGrupo } from '../seleccionar-grupo';
@Component({
  selector: 'app-temas',
  standalone: true,
  providers: [ContextoGrupoService],
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    SeleccionarGrupo,
  ],
  templateUrl: './temas.html',
  styleUrl: './temas.css',
})
export class Temas {
  readonly contexto = inject(ContextoGrupoService);
  private readonly api = inject(RecursosApiService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy = inject(DestroyRef);
  private carga?: Subscription;
  readonly temas = signal<TemaResponse[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly guardando = signal(false);
  readonly errorDialogo = signal('');
  readonly editando = signal<number | null>(null);
  readonly form = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [textoRequerido, Validators.maxLength(100)],
    }),
    descripcion: new FormControl('', { nonNullable: true, validators: Validators.maxLength(300) }),
  });
  constructor() {
    effect(() => {
      const id = this.contexto.idGrupo();
      untracked(() => this.cargar(id));
    });
  }
  cargar(id = this.contexto.idGrupo()): void {
    this.carga?.unsubscribe();
    this.temas.set([]);
    this.error.set('');
    if (!id) return;
    this.cargando.set(true);
    this.carga = this.api
      .temas(id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (r) => {
          this.temas.set(r);
          this.cargando.set(false);
        },
        error: (e) => {
          this.error.set(errorApi(e));
          this.cargando.set(false);
        },
      });
  }
  abrir(template: TemplateRef<unknown>, tema?: TemaResponse): void {
    this.editando.set(tema?.idTema ?? null);
    this.form.reset({ nombre: tema?.nombre ?? '', descripcion: tema?.descripcion ?? '' });
    this.errorDialogo.set('');
    this.dialog.open(template, { width: '600px', maxWidth: 'calc(100vw - 32px)' });
  }
  guardar(ref: MatDialogRef<unknown>): void {
    this.form.markAllAsTouched();
    const id = this.contexto.idGrupo();
    if (!id || this.form.invalid || this.guardando() || !this.contexto.puedeGestionarTemas())
      return;
    const body = {
      nombre: this.form.controls.nombre.value.trim(),
      descripcion: this.form.controls.descripcion.value.trim(),
    };
    this.guardando.set(true);
    this.errorDialogo.set('');
    ref.disableClose = true;
    const operacion = this.editando()
      ? this.api.editarTema(id, this.editando()!, body)
      : this.api.crearTema(id, body);
    operacion.pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => {
        this.guardando.set(false);
        ref.close();
        this.exito.set('Tema guardado.');
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        ref.disableClose = false;
        this.errorDialogo.set(errorApi(e));
      },
    });
  }
}
