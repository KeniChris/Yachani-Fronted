import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { CrearGrupoIa } from './crear-grupo-ia';

describe('CrearGrupoIa', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [CrearGrupoIa],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { data: { rolVista: 'tutor', modo: '' }, paramMap: convertToParamMap({}) } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(CrearGrupoIa);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Generar propuesta');
  });
});
