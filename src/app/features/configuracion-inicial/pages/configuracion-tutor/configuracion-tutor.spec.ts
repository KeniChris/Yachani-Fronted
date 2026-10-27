import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfiguracionTutor } from './configuracion-tutor';

describe('ConfiguracionTutor', () => {
  let component: ConfiguracionTutor;
  let fixture: ComponentFixture<ConfiguracionTutor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionTutor],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionTutor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
