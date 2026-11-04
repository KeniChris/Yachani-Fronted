import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EnviarMensajeRequest, MensajeChatResponse } from '../models/chat.models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly gruposUrl = `${environment.apiUrl}/grupos`;

  listarMensajes(idGrupo: number, idUsuario: number) {
    return this.http.get<MensajeChatResponse[]>(`${this.gruposUrl}/${idGrupo}/mensajes`, {
      params: { idUsuario },
    });
  }

  enviarMensaje(idGrupo: number, datos: EnviarMensajeRequest) {
    return this.http.post<MensajeChatResponse>(`${this.gruposUrl}/${idGrupo}/mensajes`, datos);
  }

  eliminarMensaje(idGrupo: number, idMensaje: number, idUsuario: number) {
    return this.http.delete<{ mensaje: string }>(
      `${this.gruposUrl}/${idGrupo}/mensajes/${idMensaje}`,
      { params: { idUsuario } },
    );
  }
}
