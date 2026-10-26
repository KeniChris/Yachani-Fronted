import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IniciarSesion } from './iniciar-sesion';
import { provideRouter } from '@angular/router';

describe('IniciarSesion', () => {
  let component: IniciarSesion;
  let fixture: ComponentFixture<IniciarSesion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciarSesion],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(IniciarSesion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks empty credentials as touched without accepting the form', () => {
    component.iniciarSesion();
    expect(component.formulario.invalid).toBe(true);
    expect(component.formulario.controls.correo.touched).toBe(true);
    expect(component.formulario.controls.contrasena.touched).toBe(true);
    expect(component.mensajeEstado).toBe('');
  });

  it('keeps valid credentials local and reports that login is unavailable', () => {
    component.formulario.setValue({ correo: 'u20260001@upc.edu.pe', contrasena: 'ejemplo-local' });
    component.iniciarSesion();
    expect(component.formulario.valid).toBe(true);
    expect(component.mensajeEstado).toBe('El inicio de sesión aún no está disponible.');
  });

  it.each(['', 'usuario', 'usuario@gmail.com', 'usuario@alumnos.upc.edu.pe', 'usuario@upc.edu.pe.ejemplo.com', 'usuario@upc.edu.pe ', 'usuario@UPC.EDU.PE', '.usuario@upc.edu.pe'])('rejects invalid institutional email: %s', (correo) => {
    component.formulario.setValue({ correo, contrasena: 'ejemplo-local' });
    component.iniciarSesion();
    expect(component.formulario.controls.correo.invalid).toBe(true);
    expect(component.formulario.controls.correo.touched).toBe(true);
    expect(component.mensajeEstado).toBe('');
  });

  it('shows the institutional email error only after touch or submission', async () => {
    component.formulario.controls.correo.setValue('usuario@gmail.com');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();
    component.formulario.controls.correo.markAsTouched();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-error')?.textContent).toContain('El correo debe terminar en @upc.edu.pe');
  });

  it('allows showing and hiding the password', async () => {
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.password-toggle');
    const password: HTMLInputElement = fixture.nativeElement.querySelector('#login-password');
    expect(password.type).toBe('password');
    toggle.click();
    await fixture.whenStable();
    expect(password.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar contraseña');
    toggle.click();
    await fixture.whenStable();
    expect(password.type).toBe('password');
  });

  it('keeps the form editable in the error state and clears the alert on correction', async () => {
    component.estadoVista = 'error';
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Correo o contraseña incorrectos.');
    const email: HTMLInputElement = fixture.nativeElement.querySelector('#login-email');
    email.value = 'correo-invalido';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(component.estadoVista).toBe('formulario');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    component.iniciarSesion();
    expect(component.formulario.invalid).toBe(true);
    expect(component.mensajeEstado).toBe('');
  });

  it('replaces the form with the success message without navigation', async () => {
    component.estadoVista = 'exito';
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.querySelector('#success-title')?.textContent).toBe('¡Inicio de sesión exitoso!');
    expect(fixture.nativeElement.querySelector('.login-success')?.textContent).toContain('Has ingresado correctamente a tu cuenta.');
  });
});
