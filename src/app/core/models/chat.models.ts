// Coincide con com.yachaniapi.chat.dto.MensajeChatResponse.
export interface MensajeChatResponse {
  idMensaje: number;
  idGrupo: number;
  idAutor: number;
  nombreAutor: string;
  contenido: string;
  fechaEnvio: string;
}

// Coincide con com.yachaniapi.chat.dto.EnviarMensajeRequest.
export interface EnviarMensajeRequest {
  idUsuario: number;
  contenido: string;
}

// Mismo límite que ChatService.MINUTOS_PARA_ELIMINAR en el backend: pasado ese tiempo
// el mensaje ya no se puede borrar.
export const MINUTOS_PARA_ELIMINAR = 2;
