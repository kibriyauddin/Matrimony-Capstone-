import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-email-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="email-test-container">
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>email</mat-icon>
            Email System Test
          </mat-card-title>
          <mat-card-subtitle>Test cancellation email functionality</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="status-section" *ngIf="emailStatus">
            <h3>Email Service Status</h3>
            <div class="status-item">
              <span class="label">Service Enabled:</span>
              <span [class]="emailStatus.enabled ? 'status-success' : 'status-error'">
                {{ emailStatus.enabled ? '✅ YES' : '❌ NO' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">SMTP Configured:</span>
              <span [class]="emailStatus.configured ? 'status-success' : 'status-error'">
                {{ emailStatus.configured ? '✅ YES' : '❌ NO' }}
              </span>
            </div>
            <div class="status-item" *ngIf="emailStatus.details">
              <span class="label">SMTP User:</span>
              <span>{{ emailStatus.details.smtpUser }}</span>
            </div>
          </div>

          <form [formGroup]="testForm" (ngSubmit)="testCancellationEmail()" class="test-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Test Email Address</mat-label>
              <input matInput formControlName="attendeeEmail" placeholder="Enter email to test">
              <mat-error *ngIf="testForm.get('attendeeEmail')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="testForm.get('attendeeEmail')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Event Name</mat-label>
              <input matInput formControlName="eventName" placeholder="Test Event Name">
              <mat-error *ngIf="testForm.get('eventName')?.hasError('required')">
                Event name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cancellation Reason</mat-label>
              <textarea matInput formControlName="reason" rows="3" placeholder="Testing email functionality"></textarea>
            </mat-form-field>

            <div class="button-group">
              <button mat-raised-button color="primary" type="submit" [disabled]="testForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                <mat-icon *ngIf="!isLoading">send</mat-icon>
                {{ isLoading ? 'Sending...' : 'Send Test Email' }}
              </button>
              
              <button mat-stroked-button type="button" (click)="checkEmailStatus()" [disabled]="isLoading">
                <mat-icon>refresh</mat-icon>
                Refresh Status
              </button>
            </div>
          </form>

          <div class="test-result" *ngIf="lastTestResult">
            <h3>Last Test Result</h3>
            <div class="result-item">
              <span class="label">Status:</span>
              <span [class]="lastTestResult.testResult.success ? 'status-success' : 'status-error'">
                {{ lastTestResult.testResult.success ? '✅ SUCCESS' : '❌ FAILED' }}
              </span>
            </div>
            <div class="result-item">
              <span class="label">Message:</span>
              <span>{{ lastTestResult.testResult.message }}</span>
            </div>
            <div class="result-item" *ngIf="lastTestResult.testResult.details?.messageId">
              <span class="label">Message ID:</span>
              <span>{{ lastTestResult.testResult.details.messageId }}</span>
            </div>
            <div class="result-item">
              <span class="label">Timestamp:</span>
              <span>{{ lastTestResult.timestamp | date:'medium' }}</span>
            </div>
          </div>

          <div class="instructions">
            <h3>How to Check Email Delivery</h3>
            <ol>
              <li>Fill in a valid email address above</li>
              <li>Click "Send Test Email"</li>
              <li>Check the server console for detailed logs</li>
              <li>Check the recipient's email inbox</li>
              <li>Look for emails with subject "❌ Booking Cancelled - [Event Name]"</li>
            </ol>
            
            <div class="console-tip">
              <mat-icon>info</mat-icon>
              <span>Check the backend server console for detailed email logs with 📧 prefixes</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .email-test-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .test-card {
      margin-bottom: 20px;
    }

    .status-section, .test-form, .test-result, .instructions {
      margin: 20px 0;
    }

    .status-item, .result-item {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .label {
      font-weight: 600;
    }

    .status-success {
      color: #4caf50;
      font-weight: 600;
    }

    .status-error {
      color: #f44336;
      font-weight: 600;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .button-group {
      display: flex;
      gap: 16px;
      margin-top: 20px;
    }

    .console-tip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #e3f2fd;
      border-radius: 4px;
      margin-top: 16px;
    }

    .instructions ol {
      padding-left: 20px;
    }

    .instructions li {
      margin: 8px 0;
    }
  `]
})
export class EmailTestComponent {
  testForm: FormGroup;
  emailStatus: any = null;
  lastTestResult: any = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.testForm = this.fb.group({
      attendeeEmail: ['', [Validators.required, Validators.email]],
      eventName: ['Test Event - Email Functionality', Validators.required],
      reason: ['Testing email system functionality']
    });

    this.checkEmailStatus();
  }

  checkEmailStatus(): void {
    this.http.get(`${environment.apiUrl}/email-test/status`).subscribe({
      next: (response: any) => {
        this.emailStatus = response;
        console.log('Email status:', response);
      },
      error: (error) => {
        console.error('Error checking email status:', error);
        this.snackBar.open('Failed to check email status', 'Close', { duration: 3000 });
      }
    });
  }

  testCancellationEmail(): void {
    if (this.testForm.valid) {
      this.isLoading = true;
      const formData = this.testForm.value;

      console.log('Testing cancellation email with data:', formData);

      this.http.post(`${environment.apiUrl}/email-test/test-cancellation`, formData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.lastTestResult = response;
          
          if (response.testResult.success) {
            this.snackBar.open('Test email sent successfully! Check the recipient inbox.', 'Close', { 
              duration: 5000,
              panelClass: ['success-snackbar']
            });
          } else {
            this.snackBar.open(`Test failed: ${response.testResult.message}`, 'Close', { 
              duration: 8000,
              panelClass: ['error-snackbar']
            });
          }

          console.log('Email test result:', response);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error testing email:', error);
          this.snackBar.open('Failed to test email functionality', 'Close', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}