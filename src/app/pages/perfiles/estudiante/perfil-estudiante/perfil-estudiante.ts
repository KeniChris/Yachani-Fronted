import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { catchError, distinctUntilChanged, forkJoin, map, of, switchMap } from 'rxjs';
import {
  PerfilEstudiantePublicoResponse,
  ResumenResponse,
} from '../../../../core/models/perfil-estudiante.models';
import { PerfilEstudianteService } from '../../../../core/services/perfil-estudiante.service';
import { ResumenService } from '../../../../core/services/resumen.service';

@Component({
  selector: 'app-perfil-estudiante',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './perfil-estudiante.html',
  styleUrls: ['../../perfiles.css', './perfil-estudiante.css'],
})
export class PerfilEstudiante implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly perfilService = inject(PerfilEstudianteService);
  private readonly resumenService = inject(ResumenService);

  readonly cargando = signal(true);
  readonly datos = signal<{
    estudiante: PerfilEstudiantePublicoResponse;
    resumenes: ResumenResponse[];
  } | null>(null);
  readonly errorDescarga = signal('');

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((parametros) => Number(parametros.get('idEstudiante'))),
        distinctUntilChanged(),
        switchMap((idEstudiante) => {
          this.cargando.set(true);
          this.datos.set(null);
          this.errorDescarga.set('');

          if (!Number.isSafeInteger(idEstudiante) || idEstudiante <= 0) {
            return of(null);
          }

          return forkJoin({
            estudiante: this.perfilService.consultarPerfilPublico(idEstudiante),
            resumenes: this.resumenService.listar(idEstudiante),
          }).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      });
  }

  descargarResumen(idUsuario: number, resumen: ResumenResponse): void {
    this.errorDescarga.set('');

    this.resumenService
      .descargar(idUsuario, resumen)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.errorDescarga.set('No pudimos descargar el archivo.'),
      });
  }
}