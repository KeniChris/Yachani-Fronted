import { Component, DestroyRef, Input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SesionEstudioResponse } from '../../core/models/sesion-estudio.models';
import {
  MINUTOS_RECORDATORIO,
  recordatoriosDeSesiones,
} from '../../core/services/recordatorio-sesion';

// "Un aviso antes de comenzar": el recordatorio dentro de la plataforma que ve el
// estudiante en la hora previa a una sesión. No pide datos propios: recibe las sesiones
// que ya cargó la pantalla y las contrasta con la hora actual.
@Component({
  selector: 'app-recordatorio-sesion',
  standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './recordatorio-sesion.html',
  styleUrl: './recordatorio-sesion.css',
})
export class RecordatorioSesion implements OnInit {
  readonly minutosAntes = MINUTOS_RECORDATORIO;
  // App zoneless: tanto las sesiones como el reloj tienen que ser signal() para que el
  // "Empieza en X minutos" se refresque solo.
  private readonly sesionesSignal = signal<readonly SesionEstudioResponse[]>([]);
  @Input() set sesiones(valor: readonly SesionEstudioResponse[] | null | undefined) {
    this.sesionesSignal.set(valor ?? []);
  }
  // En Inicio hay sesiones de varios grupos, así que ahí sí hace falta nombrarlos.
  @Input() mostrarGrupo = false;
  private readonly ahora = signal(Date.now());
  get recordatorios() {
    return recordatoriosDeSesiones(this.sesionesSignal(), this.ahora());
  }
  constructor(private readonly destroyRef: DestroyRef) {}
  ngOnInit() {
    // Cada 30 s para que la cuenta no se quede congelada con la pestaña abierta.
    const reloj = setInterval(() => this.ahora.set(Date.now()), 30000);
    this.destroyRef.onDestroy(() => clearInterval(reloj));
  }
  // Un enlace de reunión se abre fuera de Yachani; un aula física no es enlace.
  esEnlace(lugar: string): boolean {
    return /^https?:\/\//i.test(lugar.trim());
  }
}
