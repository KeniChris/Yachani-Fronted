import { Component, Input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AvisoService } from '../../../core/services/aviso.service';
import { AvisoResponse } from '../../../core/models/aviso.models';
import {
  ID_GRUPO_DEMO,
  idGrupoDesdeSlug,
} from '../../../core/services/grupo-estudio.service';
import { SesionUsuarioService } from '../../../core/services/sesion-usuario.service';

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './avisos.html',
  styleUrls: ['../grupos.css', './avisos.css'],
})
export class Avisos implements OnInit {
  // Variante visual mediante ?rol=tutor.
  @Input() rol = 'estudiante';
  // Grupo activo según el :grupoId de la ruta padre.
  idGrupo = ID_GRUPO_DEMO;
  @Input() set grupoId(valor: string) {
    this.idGrupo = idGrupoDesdeSlug(valor) ?? ID_GRUPO_DEMO;
  }
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly lista = signal<AvisoResponse[]>([]);
  readonly avisoAccion = signal('');
  readonly errorAccion = signal('');
  // Publicar (AV03) empieza vacío; editar (AV04) carga el aviso actual al abrir el diálogo.
  readonly form = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });
  constructor(
    public readonly dialog: MatDialog,
    private readonly api: AvisoService,
    private readonly sesion: SesionUsuarioService,
  ) {}
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    this.api.listarAvisos(this.idGrupo).subscribe({
      next: (lista) => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
  guardar(avisoActual: AvisoResponse | null) {
    if (this.form.invalid) return;
    this.errorAccion.set('');
    const f = this.form.getRawValue();
    const request = { idAutor: this.sesion.idUsuario(this.rol), titulo: f.titulo, mensaje: f.mensaje };
    const llamada = avisoActual
      ? this.api.editarAviso(this.idGrupo, avisoActual.idAviso, request)
      : this.api.publicarAviso(this.idGrupo, request);
    llamada.subscribe({
      next: () => {
        this.cargar();
        this.avisoAccion.set('publicado');
        this.dialog.closeAll();
      },
      error: (respuesta) => {
        this.errorAccion.set(respuesta.error?.mensaje || 'No pudimos publicar el aviso.');
        this.dialog.closeAll();
      },
    });
  }
}
