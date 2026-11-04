import { Component, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GrupoEstudioService } from '../../../core/services/grupo-estudio.service';
import { GrupoEstudioResponse } from '../../../core/models/grupo-estudio.models';

@Component({
  selector: 'app-descubrimiento',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './descubrimiento.html',
  styleUrl: './descubrimiento.css',
})
export class Descubrimiento implements OnInit {
  // Estado de la pantalla mediante ?estado=: explorar (por defecto), filtrados, vacio o error.
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  private readonly estadoSignal = signal('explorar');
  @Input() set estado(valor: string) {
    this.estadoSignal.set(valor || 'explorar');
  }
  get estado() {
    return this.estadoSignal();
  }
  // El backend compara el método de estudio de forma exacta, así que la lista tiene que
  // ser la misma que ofrece "Crear grupo".
  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];
  readonly tipos = ['Con tutor', 'Entre estudiantes'];
  readonly resultados = signal<GrupoEstudioResponse[]>([]);
  readonly cargando = signal(true);
  readonly buscarForm = new FormGroup({
    busqueda: new FormControl('', { nonNullable: true }),
  });
  readonly filtrosForm = new FormGroup({
    curso: new FormControl('', { nonNullable: true }),
    metodo: new FormControl('', { nonNullable: true }),
    tipo: new FormControl('', { nonNullable: true }),
    integrantes: new FormControl('', { nonNullable: true }),
  });
  constructor(
    public readonly dialog: MatDialog,
    private readonly api: GrupoEstudioService,
  ) {}
  ngOnInit() {
    // Al entrar se listan todos los grupos de estudio: /grupos/filtrar sin filtros
    // los devuelve todos.
    this.listarTodos();
  }
  // Listado completo, sin filtros.
  listarTodos() {
    this.cargando.set(true);
    this.api.filtrarGrupos({}).subscribe({
      next: (grupos) => this.mostrar(grupos, 'explorar'),
      error: () => {
        this.cargando.set(false);
        this.estadoSignal.set('error');
      },
    });
  }
  // US06: buscar por curso o tema.
  buscar() {
    const query = this.buscarForm.getRawValue().busqueda.trim();
    if (!query) {
      this.listarTodos();
      return;
    }
    this.cargando.set(true);
    this.api.buscarGrupos(query).subscribe({
      next: (grupos) => this.mostrar(grupos, 'filtrados'),
      error: () => {
        this.cargando.set(false);
        this.estadoSignal.set('error');
      },
    });
  }
  // US07: aplicar filtros. Los que queden vacíos no filtran.
  filtrar() {
    const f = this.filtrosForm.getRawValue();
    const tipoGrupo = f.tipo === 'Con tutor' ? 'TUTOR' : f.tipo ? 'ESTUDIANTES' : undefined;
    this.cargando.set(true);
    this.api
      .filtrarGrupos({
        curso: f.curso.trim(),
        metodoEstudio: f.metodo,
        cantidadIntegrantes: f.integrantes ? Number(f.integrantes) : undefined,
        tipoGrupo,
      })
      .subscribe({
        next: (grupos) => this.mostrar(grupos, 'filtrados'),
        error: () => {
          this.cargando.set(false);
          this.estadoSignal.set('error');
        },
      });
  }
  private mostrar(grupos: GrupoEstudioResponse[], estadoConResultados: string) {
    this.resultados.set(grupos);
    this.estadoSignal.set(grupos.length === 0 ? 'vacio' : estadoConResultados);
    this.cargando.set(false);
  }
  limpiar() {
    this.buscarForm.reset({ busqueda: '' });
    this.filtrosForm.reset({ curso: '', metodo: '', tipo: '', integrantes: '' });
    this.listarTodos();
  }
}
