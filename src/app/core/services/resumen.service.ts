import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResumenResponse } from '../models/perfil-estudiante.models';

@Injectable({ providedIn: 'root' })
export class ResumenService {
  private readonly http = inject(HttpClient);
  private readonly documento = inject(DOCUMENT);

  listar(idUsuario: number) {
    return this.http.get<ResumenResponse[]>(this.resumenesUrl(idUsuario));
  }

  publicar(idUsuario: number, titulo: string, archivo: File) {
    return this.http.post<ResumenResponse>(
      this.resumenesUrl(idUsuario),
      this.datosArchivo(titulo, archivo),
    );
  }

  reemplazar(idUsuario: number, idResumen: number, titulo: string, archivo: File) {
    return this.http.put<ResumenResponse>(
      `${this.resumenesUrl(idUsuario)}/${idResumen}`,
      this.datosArchivo(titulo, archivo),
    );
  }

  descargar(idUsuario: number, resumen: ResumenResponse) {
    const urlArchivo =
      `${this.resumenesUrl(idUsuario)}/${resumen.idResumen}/archivo`;

    return this.http.get(urlArchivo, { responseType: 'blob' }).pipe(
      tap((archivo) => {
        const url = URL.createObjectURL(archivo);
        const enlace = this.documento.createElement('a');

        enlace.href = url;
        enlace.download = resumen.nombreArchivo;
        enlace.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }),
    );
  }

  private resumenesUrl(idUsuario: number): string {
    return `${environment.apiUrl}/estudiantes/${idUsuario}/resumenes`;
  }

  private datosArchivo(titulo: string, archivo: File): FormData {
    const datos = new FormData();
    datos.append('titulo', titulo);
    datos.append('archivo', archivo);
    return datos;
  }
}