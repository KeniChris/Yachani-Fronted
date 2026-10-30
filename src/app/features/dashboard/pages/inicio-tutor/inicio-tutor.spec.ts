import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioTutor } from './inicio-tutor';

describe('InicioTutor', () => {
  let component: InicioTutor;
  let fixture: ComponentFixture<InicioTutor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioTutor],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioTutor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
