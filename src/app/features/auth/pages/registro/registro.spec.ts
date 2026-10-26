import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Registro } from './registro';
import { provideRouter } from '@angular/router';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows errors for empty fields on submit', () => {
    component.registrar();
    expect(component.estadoVista).toBe('errores');
    expect(component.formulario.invalid).toBe(true);
    expect(component.formulario.controls.correo.touched).toBe(true);
  });

  it.each(['usuario', 'usuario@gmail.com', 'usuario@alumnos.upc.edu.pe', 'usuario@upc.edu.pe.ejemplo.com', 'usuario@upc.edu.pe '])('rejects email %s', (correo) => {
    component.formulario.controls.correo.setValue(correo);
    expect(component.formulario.controls.correo.invalid).toBe(true);
  });

  it('checks password length and revalidates matching passwords in either direction', () => {
    const controls = component.formulario.controls;
    controls.contrasena.setValue('1234567');
    expect(controls.contrasena.hasError('minlength')).toBe(true);
    controls.contrasena.setValue('12345678');
    controls.confirmacion.setValue('12345679');
    expect(component.formulario.hasError('noCoinciden')).toBe(true);
    controls.confirmacion.setValue('12345678');
    expect(component.formulario.hasError('noCoinciden')).toBe(false);
    controls.contrasena.setValue('abcdefgh');
    expect(component.formulario.hasError('noCoinciden')).toBe(true);
  });

  it('never displays success merely because the fields are valid', () => {
    component.formulario.setValue({ rol: 'tutor', nombres: 'Nombre', apellidos: 'Apellido', correo: 'usuario@upc.edu.pe', contrasena: '12345678', confirmacion: '12345678' });
    component.registrar();
    expect(component.formulario.valid).toBe(true);
    expect(component.estadoVista).toBe('formulario');
    expect(component.mensajeEstado).toContain('No se creó ninguna cuenta.');
  });

  it('previews success without submitting the form', async () => {
    component.estadoVista = 'exito';
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toBe('¡Registro exitoso!');
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/login');
  });
});
