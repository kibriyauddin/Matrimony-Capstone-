import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'updateProfile']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    mockAuthService.getCurrentUser.and.returnValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'attendee',
      created_at: new Date()
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize profile form with user data', () => {
    component.ngOnInit();
    expect(component.profileForm).toBeDefined();
    expect(component.profileForm.get('name')?.value).toBe('Test User');
    expect(component.profileForm.get('email')?.value).toBe('test@example.com');
  });
});