import { Component, ElementRef, QueryList, ViewChildren, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { EstadoRecuperacion, RecoveryFlow } from '../../recovery-flow';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule],
  selector: 'app-verificar-codigo',
  styleUrls: ['../../recovery.css', './verificar-codigo.css'],
  templateUrl: './verificar-codigo.html',
})
export class VerificarCodigo {
  readonly flujo = inject(RecoveryFlow);
  private readonly router = inject(Router);
  @ViewChildren('casilla') private casillas!: QueryList<ElementRef<HTMLInputElement>>;
  readonly indices = [0, 1, 2, 3, 4, 5];
  readonly codigo = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[0-9]{6}$/)] });
  digitos = ['', '', '', '', '', ''];
  estado: EstadoRecuperacion = 'formulario';
  mensaje = '';
  mensajeError = 'No pudimos verificar el código. Inténtalo nuevamente.';

  get errorCodigo(): boolean { return this.codigo.invalid && this.codigo.touched; }

  private sincronizar(): void {
    this.codigo.setValue(this.digitos.join(''));
    this.mensaje = '';
    this.estado = 'formulario';
  }

  private enfocar(indice: number): void {
    const input = this.casillas.get(Math.max(0, Math.min(5, indice)))?.nativeElement;
    input?.focus();
    input?.select();
  }

  escribir(indice: number, event: Event): void {
    if (this.estado === 'cargando') return;
    const input = event.target as HTMLInputElement;
    const valor = input.value.replace(/[^0-9]/g, '');
    if (valor.length > 1) {
      this.distribuir(valor, indice);
      return;
    }
    this.digitos[indice] = valor;
    input.value = valor;
    this.sincronizar();
    if (valor) this.enfocar(indice + 1);
  }

  pegar(indice: number, event: ClipboardEvent): void {
    event.preventDefault();
    if (this.estado === 'cargando') return;
    const texto = (event.clipboardData?.getData('text') ?? '').trim();
    if (!/^[0-9]+$/.test(texto)) {
      this.codigo.markAsTouched();
      this.mostrarError('El código debe contener exactamente seis dígitos.');
      return;
    }
    this.distribuir(texto, texto.length === 6 ? 0 : indice);
  }

  private distribuir(valor: string, desde: number): void {
    if (valor.length > 6 - desde) {
      this.mostrarError('El código debe contener exactamente seis dígitos.');
      return;
    }
    [...valor].forEach((digito, i) => this.digitos[desde + i] = digito);
    this.sincronizar();
    this.enfocar(desde + valor.length);
  }

  teclado(indice: number, event: KeyboardEvent): void {
    if (this.estado === 'cargando') return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.enfocar(event.key === 'Home' ? 0 : event.key === 'End' ? 5 : indice + (event.key === 'ArrowLeft' ? -1 : 1));
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      const destino = this.digitos[indice] ? indice : Math.max(0, indice - 1);
      this.digitos[destino] = '';
      this.sincronizar();
      this.enfocar(destino);
    } else if (event.key === 'Delete') {
      event.preventDefault();
      this.digitos[indice] = '';
      this.sincronizar();
    }
  }

  verificar(): void {
    if (this.estado === 'cargando') return;
    this.codigo.markAsTouched();
    this.mensaje = '';
    this.estado = 'formulario';
    if (this.codigo.invalid || !this.flujo.correo()) return;
    if (this.flujo.modoPrevisualizacion) { this.confirmarVerificacion(); return; }
    // Pendiente: verificar con el backend; el formato no demuestra validez ni vigencia.
    this.mensaje = 'La verificación aún no está disponible. No se verificó el código.';
  }

  reenviar(): void {
    if (this.estado === 'cargando' || !this.flujo.correo()) return;
    this.mensaje = 'El reenvío aún no está disponible. No se envió ningún correo.';
  }

  // Conectar únicamente a la confirmación del backend (o a la vista previa explícita).
  confirmarVerificacion(): void {
    this.estado = 'exito';
    this.flujo.codigoVerificado = true;
    this.codigo.reset();
    this.digitos = ['', '', '', '', '', ''];
    void this.router.navigateByUrl('/restablecer-contrasena');
  }

  mostrarError(mensaje: string): void { this.estado = 'error'; this.mensajeError = mensaje; }
}
