import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailTestComponent } from './email-test.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('EmailTestComponent', () => {
  let component: EmailTestComponent;
  let fixture: ComponentFixture<EmailTestComponent>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [EmailTestComponent, HttpClientTestingModule],
      providers: [
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTestComponent);
    component = fixture.componentInstance;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize test forms', () => {
    expect(component.bookingTestForm).toBeDefined();
    expect(component.cancellationTestForm).toBeDefined();
    expect(component.reminderTestForm).toBeDefined();
  });
});