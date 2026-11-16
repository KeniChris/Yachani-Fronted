import { inject, Injectable, signal } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventoChat } from '../models/chat.models';
import { AuthService } from './auth.service';

// Conexión STOMP/WebSocket con el backend para recibir al instante los mensajes del chat.
// Enviar y eliminar siguen yendo por la API REST (ChatService); por aquí solo llegan avisos.
// Hay una sola conexión para toda la app: se abre al entrar al primer chat y se cierra
// cuando ya nadie escucha (por ejemplo, al salir del chat o al cerrar sesión).
@Injectable({
  providedIn: 'root',
})
export class ChatTiempoRealService {
  private readonly auth = inject(AuthService);
  private cliente?: Client;
  private oyentes = 0;
  // Se emite en cada conexión (también en las reconexiones): STOMP no recuerda las
  // suscripciones, así que cada oyente se vuelve a suscribir al recibirlo.
  private readonly conexiones = new Subject<void>();

  // true mientras el socket está conectado. El chat lo usa para decidir si hace falta
  // volver a consultar la API cada cierto tiempo como respaldo.
  readonly conectado = signal(false);

  // Avisos del chat de un grupo. Al suscribirse se abre la conexión si hacía falta; al
  // desuscribirse se deja de escuchar ese grupo.
  escucharGrupo(idGrupo: number): Observable<EventoChat> {
    return new Observable<EventoChat>((suscriptor) => {
      const cliente = this.abrir();
      let suscripcion: StompSubscription | undefined;
      const suscribir = () => {
        suscripcion = cliente.subscribe(`/topic/grupos/${idGrupo}/mensajes`, (frame) => {
          try {
            suscriptor.next(JSON.parse(frame.body) as EventoChat);
          } catch {
            // Un aviso mal formado no debe romper el chat: se ignora.
          }
        });
      };
      if (cliente.connected) suscribir();
      const alConectar = this.conexiones.subscribe(suscribir);
      return () => {
        alConectar.unsubscribe();
        if (cliente.connected) suscripcion?.unsubscribe();
        this.liberar();
      };
    });
  }

  private abrir(): Client {
    this.oyentes++;
    if (this.cliente) return this.cliente;
    const cliente = new Client({
      brokerURL: environment.wsUrl,
      // Si se corta, reintenta cada 5 s (con espera creciente hasta 30 s).
      reconnectDelay: 5000,
      maxReconnectDelay: 30000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      // El token se lee justo antes de cada intento: tras una reconexión se usa el vigente.
      beforeConnect: (c) => {
        const token = this.auth.obtenerToken();
        c.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      },
    });
    // Solo el cliente vigente toca el estado: el cierre tardío de una conexión anterior
    // no debe marcar como desconectada a la nueva.
    const vigente = () => this.cliente === cliente;
    cliente.onConnect = () => {
      if (!vigente()) return;
      this.conectado.set(true);
      this.conexiones.next();
    };
    cliente.onWebSocketClose = () => {
      if (vigente()) this.conectado.set(false);
    };
    cliente.onStompError = () => {
      if (vigente()) this.conectado.set(false);
    };
    this.cliente = cliente;
    cliente.activate();
    return cliente;
  }

  private liberar() {
    this.oyentes = Math.max(0, this.oyentes - 1);
    if (this.oyentes > 0 || !this.cliente) return;
    const cliente = this.cliente;
    this.cliente = undefined;
    this.conectado.set(false);
    void cliente.deactivate();
  }
}
