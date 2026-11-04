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
  mensaje: string | null;
  configuracionCompletada: boolean;
}

export interface LoginResponse extends UsuarioResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface SesionGuardada {
  usuario: UsuarioResponse;
  accessToken: string;
  venceEn: number;
}