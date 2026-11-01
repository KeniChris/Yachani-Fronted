import {
  booleanAttribute,
  Component,
  ElementRef,
  Input,
  OnChanges,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  host: { class: 'recovery-page' },
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './verificar-codigo.html',
  styleUrl: './verificar-codigo.css',
})
export class VerificarCodigo implements OnChanges {
  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';
  @ViewChildren('digit') casillas!: QueryList<ElementRef<HTMLInputElement>>;
  readonly indices = [0, 1, 2, 3, 4, 5];
  readonly form = new FormGroup(
    Object.fromEntries(
      this.indices.map((i) => [
        String(i),
        new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.pattern(/^[0-9]$/)],
        }),
      ]),
    ),
  );
  ngOnChanges(): void {
    if (this.previsualizacion && this.estado === 'error') this.form.markAllAsTouched();
  }
  escribir(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(input.value) && index < 5) this.enfocar(index + 1);
  }
  pegar(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const texto = event.clipboardData?.getData('text').trim() ?? '';
    if (!/^[0-9]{1,6}$/.test(texto)) {
      this.form.markAllAsTouched();
      return;
    }
    const inicio = texto.length === 6 ? 0 : index;
    for (let offset = 0; offset < texto.length && inicio + offset < 6; offset++) {
      const control = this.form.controls[String(inicio + offset)];
      control.setValue(texto[offset]);
      control.markAsDirty();
    }
    this.enfocar(Math.min(inicio + texto.length, 5));
  }
  teclado(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.form.controls[String(index)].value && index > 0) {
      event.preventDefault();
      const anterior = this.form.controls[String(index - 1)];
      anterior.setValue('');
      anterior.markAsDirty();
      this.enfocar(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.enfocar(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.enfocar(index + 1);
    }
  }
  private enfocar(index: number): void {
    const input = this.casillas.get(index)?.nativeElement;
    input?.focus();
    input?.select();
  }
  verificar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return; /* No se verifica ningún código localmente. */
  }
}
