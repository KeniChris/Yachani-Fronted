import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MisGrupos } from './mis-grupos';

describe('MisGrupos', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [MisGrupos],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { data: { rolVista: 'tutor', modo: '' }, paramMap: convertToParamMap({}) } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(MisGrupos);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Crear con IA');
  });
});
