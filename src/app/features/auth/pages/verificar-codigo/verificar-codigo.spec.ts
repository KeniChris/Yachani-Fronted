import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificarCodigo } from './verificar-codigo';

describe('VerificarCodigo', () => {
  let component: VerificarCodigo;
  let fixture: ComponentFixture<VerificarCodigo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificarCodigo],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificarCodigo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
