import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfiguracionEstudiante } from './configuracion-estudiante';

describe('ConfiguracionEstudiante', () => {
  let component: ConfiguracionEstudiante;
  let fixture: ComponentFixture<ConfiguracionEstudiante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionEstudiante],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionEstudiante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
