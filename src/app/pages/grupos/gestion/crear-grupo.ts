import { Component, Input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GrupoEstudioService } from '../../../core/services/grupo-estudio.service';
import { SesionUsuarioService } from '../../../core/services/sesion-usuario.service';

@Component({
  selector: 'app-crear-grupo',
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
  templateUrl: './crear-grupo.html',
  styleUrls: ['../grupos.css', './crear-grupo.css'],
})
export class CrearGrupo {
  // Variante visual mediante ?rol=tutor: G04 (tutor) y G05 (estudiante). Si hay sesión
  // iniciada manda el tipo de usuario real; si no, el ?rol= de la vista previa.
  private rolVisible = 'estudiante';
  @Input() set rol(valor: string) {
    this.rolVisible = valor || 'estudiante';
  }
  get esTutor() {
    return this.sesion.esTutor(this.rolVisible);
  }
  // Límite de grupos alcanzado (G08 tutor, G14 estudiante) mediante ?crear=limite.
  @Input() crear = '';
  // Mismos métodos que la configuración inicial del tutor.
  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];
  // Formulario de creación: empieza vacío y los ejemplos de Figma van como placeholder.
  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
    metodo: new FormControl('', { nonNullable: true, validators: Validators.required }),
    capacidad: new FormControl<number | null>(null, [Validators.required, Validators.min(2)]),
  });
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  readonly errorCrear = signal('');
  // El backend limita cuántos grupos puede crear cada quien (10 tutor, 5 estudiante);
  // cuando responde con ese error se muestra la pantalla de límite alcanzado.
  readonly limiteAlcanzado = signal(false);
  readonly mensajeLimite = signal('');
  constructor(
    private readonly api: GrupoEstudioService,
    private readonly router: Router,
    private readonly sesion: SesionUsuarioService,
  ) {}
  // US09: crear grupo. El backend recibe idCreador y deduce el tipo de grupo
  // (TUTOR o ESTUDIANTES) del tipo de usuario, así que vale para ambos roles.
  crearGrupo() {
    if (this.form.invalid) return;
    this.errorCrear.set('');
    const f = this.form.getRawValue();
    this.api
      .crearGrupo({
        nombre: f.nombre,
        descripcion: f.descripcion,
        metodoEstudio: f.metodo,
        capacidadMaxima: f.capacidad!,
        idCreador: this.sesion.idUsuario(this.rolVisible),
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/grupos/gestion'], { queryParams: { grupos: 'creado' } });
        },
        error: (respuesta) => {
          const mensaje: string = respuesta.error?.mensaje || '';
          if (mensaje.toLowerCase().includes('máximo')) {
            this.mensajeLimite.set(mensaje);
            this.limiteAlcanzado.set(true);
            return;
          }
          this.errorCrear.set(mensaje || 'No pudimos crear el grupo.');
        },
      });
  }
}
