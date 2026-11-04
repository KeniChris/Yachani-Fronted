import { Component, Input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  GrupoEstudioService,
  ID_GRUPO_DEMO,
  idGrupoDesdeSlug,
} from '../../../core/services/grupo-estudio.service';
import { GrupoEstudioResponse } from '../../../core/models/grupo-estudio.models';
import { crearAvisoTemporal } from '../../../core/services/aviso-temporal';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './configuracion.html',
  styleUrls: ['../grupos.css', './configuracion.css'],
})
export class Configuracion implements OnInit {
  // Variante visual mediante ?rol=tutor y grupo entre estudiantes (G21) mediante ?admin=si.
  @Input() rol = 'estudiante';
  @Input() admin = '';
  // Grupo activo según el :grupoId de la ruta padre.
  idGrupo = ID_GRUPO_DEMO;
  @Input() set grupoId(valor: string) {
    this.idGrupo = idGrupoDesdeSlug(valor) ?? ID_GRUPO_DEMO;
  }
  // Estados de Figma mediante ?configuracion=: editar (G22/G23) y actualizado (G24/G25).
  // El aviso de "Nombre actualizado" se desvanece a los 3 s aunque el ?configuracion=
  // siga en la URL.
  readonly avisoActualizado = crearAvisoTemporal();
  private configuracionVisible = '';
  @Input() set configuracion(valor: string) {
    this.configuracionVisible = valor || '';
    if (valor === 'actualizado') {
      this.avisoActualizado.mostrar();
    }
  }
  get configuracion() {
    return this.configuracionVisible;
  }
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly grupo = signal<GrupoEstudioResponse | null>(null);
  readonly errorNombre = signal('');
  readonly errorPublicaciones = signal('');
  readonly publicacionesForm = new FormGroup({
    publicaciones: new FormControl(true, { nonNullable: true }),
  });
  readonly nombreForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  constructor(
    private readonly api: GrupoEstudioService,
    private readonly router: Router,
  ) {}
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    this.api.obtenerGrupo(this.idGrupo).subscribe({
      next: (grupo) => {
        this.grupo.set(grupo);
        if (grupo.permitirPublicaciones !== undefined) {
          this.publicacionesForm.setValue({ publicaciones: grupo.permitirPublicaciones });
        }
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
  editarNombre() {
    if (this.nombreForm.invalid) return;
    this.errorNombre.set('');
    this.api.editarNombre(this.idGrupo, this.nombreForm.getRawValue().nombre).subscribe({
      next: (grupo) => {
        this.grupo.set(grupo);
        this.router.navigate([], { queryParams: { configuracion: 'actualizado' }, queryParamsHandling: 'merge' });
      },
      error: (respuesta) => {
        this.errorNombre.set(respuesta.error?.mensaje || 'No pudimos actualizar el nombre.');
      },
    });
  }
  cambiarPublicaciones(permitir: boolean) {
    this.errorPublicaciones.set('');
    this.api.cambiarPublicaciones(this.idGrupo, permitir).subscribe({
      error: (respuesta) => {
        this.errorPublicaciones.set(respuesta.error?.mensaje || 'No pudimos actualizar esta opción.');
        this.publicacionesForm.patchValue({ publicaciones: !permitir });
      },
    });
  }
}
