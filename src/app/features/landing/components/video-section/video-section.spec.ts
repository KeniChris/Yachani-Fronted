import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoSection } from './video-section';

describe('VideoSection', () => {
  let component: VideoSection;
  let fixture: ComponentFixture<VideoSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoSection],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
