import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrupoSolicitudes } from './grupo-solicitudes';
import { proveedoresPestana } from '../../grupos.testing';

describe('GrupoSolicitudes', () => {
  let fixture: ComponentFixture<GrupoSolicitudes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupoSolicitudes],
      providers: proveedoresPestana('tutor'),
    }).compileComponents();

    fixture = TestBed.createComponent(GrupoSolicitudes);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Solicitudes de ingreso');
  });
});
