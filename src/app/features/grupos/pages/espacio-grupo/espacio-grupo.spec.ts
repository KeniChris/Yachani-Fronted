import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { rutasGrupos } from '../../grupos.routes';

describe('EspacioGrupo', () => {
  it('muestra la pestaña Solicitudes solo al tutor', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(rutasGrupos)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tutor/grupos/dominando-calculo/chat');
    expect(harness.routeNativeElement?.textContent).toContain('Solicitudes');
    await harness.navigateByUrl('/estudiante/grupos/dominando-calculo/chat');
    expect(harness.routeNativeElement?.textContent).not.toContain('Solicitudes');
    // Las pestañas se cargan de forma diferida; en la suite completa tarda más de 5 s.
  }, 20_000);

  it('abre Flashcards como pestaña del grupo y el repaso fuera de ella', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(rutasGrupos)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tutor/grupos/dominando-calculo/flashcards');
    // La pestaña activa se calcula con la URL de NavigationEnd: esperar el siguiente render.
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('Mazos del grupo');
    expect(harness.routeNativeElement?.querySelector('.group-tabs .is-active')?.textContent).toContain('Flashcards');
    expect(harness.routeNativeElement?.querySelector('a[href$="/flashcards/1"]')?.getAttribute('href'))
      .toBe('/app/tutor/grupos/dominando-calculo/flashcards/1');

    await harness.navigateByUrl('/tutor/grupos/dominando-calculo/flashcards/elegir');
    expect(harness.routeNativeElement?.textContent).toContain('Compartir un mazo');

    await harness.navigateByUrl('/tutor/grupos/dominando-calculo/flashcards/1');
    expect(harness.routeNativeElement?.querySelector('.group-tabs')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('a[href$="/repaso/pregunta"]')?.getAttribute('href'))
      .toBe('/app/tutor/grupos/dominando-calculo/flashcards/1/repaso/pregunta');
  }, 20_000);

  it('abre Temas y materiales como pestaña del grupo, activa también en Materiales', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(rutasGrupos)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/estudiante/grupos/dominando-calculo/temas');
    expect(harness.routeNativeElement?.textContent).toContain('Temas del grupo');
    expect(harness.routeNativeElement?.querySelector('a[href$="/temas/1/materiales"]')?.getAttribute('href'))
      .toBe('/app/estudiante/grupos/dominando-calculo/temas/1/materiales');

    await harness.navigateByUrl('/estudiante/grupos/dominando-calculo/materiales/1');
    // La pestaña activa se calcula con la URL de NavigationEnd: esperar el siguiente render.
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.querySelector('.group-tabs [aria-current="page"]')?.textContent)
      .toContain('Temas y materiales');
  }, 20_000);
});
