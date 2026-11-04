import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MazoCompartidoResponse, MazoDetalleResponse, MazoRequest, MazoResponse, OperacionFlashcards, ProgresoResponse, TarjetaRequest, TarjetaResponse } from '../models/flashcards.models';
@Injectable({ providedIn: 'root' })
export class FlashcardsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  propios() { return this.http.get<MazoResponse[]>(`${this.base}/mazos`); }
  detalle(id: number) { return this.http.get<MazoDetalleResponse>(`${this.base}/mazos/${id}`); }
  publicaciones(id: number) { return this.http.get<MazoCompartidoResponse[]>(`${this.base}/mazos/${id}/publicaciones`); }
  crear(body: MazoRequest) { return this.http.post<OperacionFlashcards<MazoResponse>>(`${this.base}/mazos`, body).pipe(map(r => r.datos)); }
  editar(id: number, body: MazoRequest) { return this.http.put<OperacionFlashcards<MazoResponse>>(`${this.base}/mazos/${id}`, body).pipe(map(r => r.datos)); }
  agregarTarjeta(id: number, body: TarjetaRequest) { return this.http.post<OperacionFlashcards<TarjetaResponse>>(`${this.base}/mazos/${id}/tarjetas`, body).pipe(map(r => r.datos)); }
  editarTarjeta(id: number, tarjeta: number, body: TarjetaRequest) { return this.http.put<OperacionFlashcards<TarjetaResponse>>(`${this.base}/mazos/${id}/tarjetas/${tarjeta}`, body).pipe(map(r => r.datos)); }
  eliminarTarjeta(id: number, tarjeta: number) { return this.http.delete<void>(`${this.base}/mazos/${id}/tarjetas/${tarjeta}`); }
  delGrupo(grupo: number, idTema: number | null = null) { return this.http.get<MazoCompartidoResponse[]>(`${this.base}/grupos/${grupo}/mazos`, { params: idTema === null ? {} : { idTema } }); }
  detalleGrupo(grupo: number, id: number) { return this.http.get<MazoDetalleResponse>(`${this.base}/grupos/${grupo}/mazos/${id}`); }
  compartir(grupo: number, id: number, idTema: number) { return this.http.put<OperacionFlashcards<MazoCompartidoResponse>>(`${this.base}/grupos/${grupo}/mazos/${id}`, { idTema }).pipe(map(r => r.datos)); }
  retirarDeGrupo(grupo: number, id: number) { return this.http.delete<void>(`${this.base}/grupos/${grupo}/mazos/${id}`); }
  retirarPublicacion(id: number) { return this.http.delete<OperacionFlashcards<MazoResponse>>(`${this.base}/mazos/${id}/publicacion`).pipe(map(r => r.datos)); }
  progreso(id: number) { return this.http.get<ProgresoResponse>(`${this.base}/mazos/${id}/progreso`); }
  guardarProgreso(id: number, tarjeta: number, aprendida: boolean) { return this.http.put<OperacionFlashcards<ProgresoResponse>>(`${this.base}/mazos/${id}/tarjetas/${tarjeta}/progreso`, { aprendida }).pipe(map(r => r.datos)); }
}
