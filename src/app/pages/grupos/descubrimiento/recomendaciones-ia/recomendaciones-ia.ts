import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PerfilEstudianteService } from '../../../../core/services/perfil-estudiante.service';
import { PerfilAcademicoResponse } from '../../../../core/models/perfil-estudiante.models';

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
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilEstudianteService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargandoPerfil = signal(true);
  readonly errorPerfil = signal('');
  readonly perfil = signal<PerfilAcademicoResponse | null>(null);

  readonly metodos = [
    'Visual',
    'Práctico',
    'Lectura',
    'Debate',
    'Flashcards',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
  ];

  readonly tipos = ['Con tutor', 'Entre estudiantes'];

  readonly form = new FormGroup({
    curso: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(120),
      ],
    }),
    metodo: new FormControl('', {
      nonNullable: true,
    }),
    tipo: new FormControl('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    if (!this.authService.estaAutenticado()) {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }

    const usuario = this.authService.usuario();

    if (!usuario) {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }

    if (usuario.tipoUsuario !== 'ESTUDIANTE') {
      void this.router.navigateByUrl('/inicio');
      return;
    }

    this.cargandoPerfil.set(true);
    this.errorPerfil.set('');
    this.perfil.set(null);
    this.form.disable();

    this.perfilService
      .consultarPerfil(usuario.idUsuario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.cargandoPerfil.set(false);
        }),
      )
      .subscribe({
        next: (datos) => {
          if (!datos.configuracionCompletada) {
            void this.router.navigateByUrl(
              '/configuracion-inicial/estudiante',
            );
            return;
          }

          this.perfil.set(datos);

          // Usa el primer curso registrado como punto de partida.
          // El estudiante puede cambiarlo para esta búsqueda.
          const cursoInicial =
            datos.conocimientos[0]?.curso ??
            datos.temasInteres[0] ??
            '';

          const metodoInicial =
            datos.metodoPreferido?.trim() ?? '';

          // Permite mostrar métodos que existan en perfiles anteriores.
          if (
            metodoInicial &&
            !this.metodos.includes(metodoInicial)
          ) {
            this.metodos.push(metodoInicial);
          }

          this.form.reset({
            curso: cursoInicial,
            metodo: metodoInicial,
            tipo: '',
          });

          this.form.enable();
        },
        error: (error: HttpErrorResponse) => {
          this.errorPerfil.set(
            error.status === 0
              ? 'No pudimos conectar con el servidor.'
              : 'No pudimos cargar tus preferencias. Inténtalo nuevamente.',
          );
        },
      });
  }
}