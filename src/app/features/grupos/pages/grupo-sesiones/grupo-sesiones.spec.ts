import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrupoSesiones } from './grupo-sesiones';
import { proveedoresPestana } from '../../grupos.testing';

describe('GrupoSesiones', () => {
  let fixture: ComponentFixture<GrupoSesiones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupoSesiones],
      providers: proveedoresPestana('tutor'),
    }).compileComponents();

    fixture = TestBed.createComponent(GrupoSesiones);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Programar sesión');
  });
});
