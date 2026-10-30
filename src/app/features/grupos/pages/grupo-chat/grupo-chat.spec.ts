import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrupoChat } from './grupo-chat';
import { proveedoresPestana } from '../../grupos.testing';

describe('GrupoChat', () => {
  let fixture: ComponentFixture<GrupoChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupoChat],
      providers: proveedoresPestana('estudiante'),
    }).compileComponents();

    fixture = TestBed.createComponent(GrupoChat);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Chat del grupo');
  });
});
