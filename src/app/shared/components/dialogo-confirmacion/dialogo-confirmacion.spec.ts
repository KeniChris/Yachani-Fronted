import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogoConfirmacion } from './dialogo-confirmacion';

describe('DialogoConfirmacion', () => {
  it('muestra el título y el mensaje recibidos', async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoConfirmacion],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: { titulo: '¿Cancelar sesión?', mensaje: 'Se avisará al grupo.', confirmar: 'Sí, cancelar' } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(DialogoConfirmacion);
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('¿Cancelar sesión?');
    expect(texto).toContain('Se avisará al grupo.');
  });
});
