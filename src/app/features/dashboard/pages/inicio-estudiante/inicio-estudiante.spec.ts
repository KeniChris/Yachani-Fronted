import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioEstudiante } from './inicio-estudiante';

describe('InicioEstudiante', () => {
  let component: InicioEstudiante;
  let fixture: ComponentFixture<InicioEstudiante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioEstudiante],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioEstudiante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
