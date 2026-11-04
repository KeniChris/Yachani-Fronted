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
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PerfilTutorService } from '../../../../core/services/perfil-tutor.service';
import { TutorPerfilResponse } from '../../../../core/models/perfil-tutor.models';

@Component({
  selector: 'app-mi-perfil-tutor',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './mi-perfil-tutor.html',
  styleUrls: ['../../perfiles.css', './mi-perfil-tutor.css'],
})
export class MiPerfilTutor implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilTutorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly perfil = signal<TutorPerfilResponse | null>(null);

  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];

  readonly presentacionForm = new FormGroup({
    presentacion: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(500),
      ],
    }),
    metodo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get iniciales(): string {
    const datos = this.perfil();

    if (!datos) {
      return '';
    }

    const nombre = Array.from(datos.nombres.trim())[0] ?? '';
    const apellido = Array.from(datos.apellidos.trim())[0] ?? '';

    return `${nombre}${apellido}`.toLocaleUpperCase();
  }

  constructor(public readonly dialog: MatDialog) {}

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

    if (usuario.tipoUsuario !== 'TUTOR') {
      void this.router.navigateByUrl('/perfiles?rol=estudiante');
      return;
    }

    this.cargando.set(true);
    this.errorCarga.set('');

    this.perfilService
      .consultarPerfil(usuario.idUsuario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (datos) => {
          this.perfil.set(datos);
          this.prepararEdicion();
        },
        error: (error: HttpErrorResponse) => {
          this.errorCarga.set(
            error.status === 0
              ? 'No pudimos conectar con el servidor.'
              : 'No pudimos cargar tu perfil. Vuelve a intentarlo.',
          );
        },
      });
  }

  prepararEdicion(): void {
    const datos = this.perfil();

    this.presentacionForm.reset({
      presentacion: datos?.presentacion ?? '',
      metodo: datos?.metodoEnsenanza ?? '',
    });
  }
}