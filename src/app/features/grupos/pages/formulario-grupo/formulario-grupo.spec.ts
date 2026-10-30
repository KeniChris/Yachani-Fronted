import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { FormularioGrupo } from './formulario-grupo';

describe('FormularioGrupo', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioGrupo],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { data: { rolVista: 'tutor', modo: 'crear' }, paramMap: convertToParamMap({}) } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(FormularioGrupo);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Crear grupo de estudio');
  });
});
