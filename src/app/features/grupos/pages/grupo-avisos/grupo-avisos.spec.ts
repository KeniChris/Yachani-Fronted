import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrupoAvisos } from './grupo-avisos';
import { proveedoresPestana } from '../../grupos.testing';

describe('GrupoAvisos', () => {
  let fixture: ComponentFixture<GrupoAvisos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupoAvisos],
      providers: proveedoresPestana('tutor'),
    }).compileComponents();

    fixture = TestBed.createComponent(GrupoAvisos);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Publicar aviso');
  });
});
