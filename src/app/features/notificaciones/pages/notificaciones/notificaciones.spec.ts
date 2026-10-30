import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Notificaciones } from './notificaciones';

describe('Notificaciones', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [Notificaciones], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(Notificaciones);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Próximos recordatorios');
  });
});
