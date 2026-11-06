import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-aviso-operacion',
  standalone: true,
  imports: [MatIconModule],
  template: `@if (mensaje) {
    <div class="aviso" [class.error]="tipo === 'error'" [class.exito]="tipo === 'exito'"
      [attr.role]="tipo === 'error' ? 'alert' : 'status'">
      <mat-icon fontSet="material-symbols-rounded" aria-hidden="true">{{ tipo === 'error' ? 'error' : tipo === 'exito' ? 'check_circle' : 'info' }}</mat-icon>
      <p>{{ mensaje }}</p>
    </div>
  }`,
  styles: [`
    :host { display: block; min-width: 0; }
    .aviso { display: flex; align-items: flex-start; gap: 12px; margin-block: 16px; padding: 16px; border-radius: 12px; background: var(--color-active); color: var(--color-primary); }
    mat-icon { flex: none; }
    p { margin: 0; overflow-wrap: anywhere; }
    .error { background: var(--color-error-surface); color: var(--color-error); }
    .exito { background: var(--color-success-surface); color: var(--color-success); }
  `],
})
export class AvisoOperacion {
  @Input() mensaje = '';
  @Input() tipo: 'informacion' | 'error' | 'exito' = 'informacion';
}
