import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestApiComponent } from './test-api.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TestApiComponent', () => {
  let component: TestApiComponent;
  let fixture: ComponentFixture<TestApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestApiComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TestApiComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.result).toBeNull();
    expect(component.error).toBeNull();
    expect(component.loading).toBeFalse();
  });
});