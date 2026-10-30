import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrupoIntegrantes } from './grupo-integrantes';
import { proveedoresPestana } from '../../grupos.testing';

describe('GrupoIntegrantes', () => {
  let fixture: ComponentFixture<GrupoIntegrantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupoIntegrantes],
      providers: proveedoresPestana('tutor'),
    }).compileComponents();

    fixture = TestBed.createComponent(GrupoIntegrantes);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Editar límite de integrantes');
  });
});
