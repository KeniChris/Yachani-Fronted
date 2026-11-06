import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ContactoRequest {
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class ContactoService {
  private readonly http = inject(HttpClient);

  enviar(datos: ContactoRequest) {
    return this.http.post<{ mensaje: string }>(`${environment.apiUrl}/contacto`, datos);
  }
}
