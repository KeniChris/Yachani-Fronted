export type TipoUsuario = 'ESTUDIANTE' | 'TUTOR';

export interface RegistroRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  tipoUsuario: TipoUsuario;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface UsuarioResponse {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  tipoUsuario: TipoUsuario;
  mensaje: string;
}