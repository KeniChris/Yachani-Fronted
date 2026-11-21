import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TipoGrupo } from '../../../../core/models/grupo-estudio.models';
import { PerfilAcademicoResponse } from '../../../../core/models/perfil-estudiante.models';
import { AuthService } from '../../../../core/services/auth.service';
import { PerfilEstudianteService } from '../../../../core/services/perfil-estudiante.service';
import {
  GrupoRecomendado,
  RecomendacionesIaService,
} from '../../../../core/services/recomendaciones-ia.service';

@Component({
  selector: 'app-recomendaciones-ia',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './recomendaciones-ia.html',
  styleUrl: './recomendaciones-ia.css',
})
export class RecomendacionesIa implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly perfiles = inject(PerfilEstudianteService);
  private readonly api = inject(RecomendacionesIaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargandoPerfil = signal(true);
  readonly errorPerfil = signal('');
  readonly perfil = signal<PerfilAcademicoResponse | null>(null);
  readonly buscando = signal(false);
  readonly errorBusqueda = signal('');
  readonly cursoConsultado = signal('');
  readonly grupos = signal<GrupoRecomendado[]>([]);

  readonly metodos = [
    'Visual', 'Práctico', 'Lectura', 'Debate', 'Flashcards',
    'Teórico', 'Participativo', 'Resolución de ejercicios',
  ];

  readonly form = new FormGroup({
    curso: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)],
    }),
    metodo: new FormControl('', { nonNullable: true }),
    tipo: new FormControl<TipoGrupo | ''>('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    const usuario = this.auth.usuario();
    if (!usuario || !this.auth.estaAutenticado()) {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }
    if (usuario.tipoUsuario !== 'ESTUDIANTE') {
      void this.router.navigateByUrl('/inicio');
      return;
    }

    this.cargandoPerfil.set(true);
    this.errorPerfil.set('');
    this.perfiles.consultarPerfil(usuario.idUsuario).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargandoPerfil.set(false)),
    ).subscribe({
      next: (datos) => {
        if (!datos.configuracionCompletada) {
          void this.router.navigateByUrl('/configuracion-inicial/estudiante');
          return;
        }
        this.perfil.set(datos);
        const metodo = datos.metodoPreferido?.trim();
        if (metodo && !this.metodos.includes(metodo)) {
          this.metodos.push(metodo);
        }
        this.form.reset({ curso: datos.conocimientos[0]?.curso ?? '', metodo: '', tipo: '' });
      },
      error: () => this.errorPerfil.set('No pudimos cargar tus preferencias. Inténtalo nuevamente.'),
    });
  }

  recomendar(): void {
    if (this.buscando() || !this.perfil()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { curso, metodo, tipo } = this.form.getRawValue();
    const cursoLimpio = curso.trim();
    this.buscando.set(true);
    this.errorBusqueda.set('');
    this.cursoConsultado.set('');
    this.grupos.set([]);
    this.form.disable();

    this.api.recomendar({
      curso: cursoLimpio,
      metodoEstudio: metodo || undefined,
      tipoGrupo: tipo || undefined,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.form.enable();
        this.buscando.set(false);
      }),
    ).subscribe({
      next: ({ recomendaciones }) => {
        this.grupos.set(recomendaciones);
        this.cursoConsultado.set(cursoLimpio);
      },
      error: (error: HttpErrorResponse) => {
        const mensaje = error.status === 503
          ? 'Las recomendaciones con IA no están disponibles por el momento. Inténtalo nuevamente.'
          : error.error?.mensaje || 'No pudimos obtener recomendaciones. Inténtalo nuevamente.';
        this.errorBusqueda.set(mensaje);
      },
    });
  }
}