import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuickStatsComponent } from './quick-stats.component';

describe('QuickStatsComponent', () => {
  let component: QuickStatsComponent;
  let fixture: ComponentFixture<QuickStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickStatsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickStatsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default stats values', () => {
    expect(component.stats).toBeDefined();
    expect(component.stats.totalEvents).toBe(0);
    expect(component.stats.totalAttendees).toBe(0);
    expect(component.stats.totalRevenue).toBe(0);
  });
});