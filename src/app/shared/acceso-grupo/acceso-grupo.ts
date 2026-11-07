import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ContextoGrupoService } from '../../core/services/contexto-grupo.service';
import { AvisoOperacion } from '../aviso-operacion/aviso-operacion';

@Component({
  selector: 'app-acceso-grupo',
  standalone: true,
  imports: [RouterLink, MatButtonModule, AvisoOperacion],
  template: `
    @if (contexto.cargando()) {
      <p role="status">Comprobando tu acceso al grupo…</p>
    } @else if (!contexto.idGrupo()) {
      <app-aviso-operacion tipo="error" mensaje="El identificador del grupo no es válido." />
    } @else if (contexto.sinAcceso()) {
      <section aria-label="Acceso al grupo">
        <h2>Aún no perteneces a este grupo</h2>
        <p>Solicita tu ingreso para consultar sus temas, materiales y flashcards.</p>
        <a mat-stroked-button [routerLink]="['/grupos/descubrimiento', contexto.idGrupo()]">Ver grupo y solicitar ingreso</a>
      </section>
    } @else if (contexto.error()) {
      <app-aviso-operacion tipo="error" [mensaje]="contexto.error()" />
      <button mat-button type="button" (click)="contexto.recargar()">Reintentar acceso</button>
    }
  `,
  styles: [`section { padding: 24px; border: 1px solid var(--color-outline); border-radius: 16px; background: var(--color-surface); } h2 { margin-top: 0; }`],
})
export class AccesoGrupo {
  @Input({ required: true }) contexto!: ContextoGrupoService;
}
