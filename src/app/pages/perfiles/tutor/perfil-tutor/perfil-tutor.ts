import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { catchError, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { PerfilTutorPublicoResponse } from '../../../../core/models/resena.models';
import { AuthService } from '../../../../core/services/auth.service';
import {
  formatearPromedio,
  inicialesDe,
  ResenaService,
} from '../../../../core/services/resena.service';

@Component({
  selector: 'app-perfil-tutor',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './perfil-tutor.html',
  styleUrls: ['../../perfiles.css', './perfil-tutor.css'],
})
export class PerfilTutor implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resenaService = inject(ResenaService);
  private readonly authService = inject(AuthService);

  readonly cargando = signal(true);
  readonly tutor = signal<PerfilTutorPublicoResponse | null>(null);
  readonly formatearPromedio = formatearPromedio;
  readonly inicialesDe = inicialesDe;

  // Solo los estudiantes pueden escribir reseñas.
  get esEstudiante(): boolean {
    return this.authService.usuario()?.tipoUsuario === 'ESTUDIANTE';
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((parametros) => Number(parametros.get('idTutor'))),
        distinctUntilChanged(),
        switchMap((idTutor) => {
          this.cargando.set(true);
          this.tutor.set(null);

          if (!Number.isSafeInteger(idTutor) || idTutor <= 0) {
            return of(null);
          }

          return this.resenaService
            .consultarPerfilTutor(idTutor)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tutor) => {
        this.tutor.set(tutor);
        this.cargando.set(false);
      });
  }
}
