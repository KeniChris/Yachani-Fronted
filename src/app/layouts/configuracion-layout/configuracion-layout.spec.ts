import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfiguracionLayout } from './configuracion-layout';

describe('ConfiguracionLayout', () => {
  let component: ConfiguracionLayout;
  let fixture: ComponentFixture<ConfiguracionLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
