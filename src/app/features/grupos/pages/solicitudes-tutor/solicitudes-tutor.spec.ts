import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { SolicitudesTutor } from './solicitudes-tutor';

describe('SolicitudesTutor', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesTutor],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { data: { rolVista: 'tutor', modo: '' }, paramMap: convertToParamMap({}) } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(SolicitudesTutor);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Jorge Lazo');
  });
});
