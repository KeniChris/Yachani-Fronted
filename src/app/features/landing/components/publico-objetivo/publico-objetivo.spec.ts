import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicoObjetivo } from './publico-objetivo';

describe('PublicoObjetivo', () => {
  let component: PublicoObjetivo;
  let fixture: ComponentFixture<PublicoObjetivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicoObjetivo],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicoObjetivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
