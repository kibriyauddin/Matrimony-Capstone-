import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'right',
    verticalPosition: 'top'
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, action?: string, duration?: number): void {
    this.show(message, 'success', action, duration);
  }

  error(message: string, action?: string, duration?: number): void {
    this.show(message, 'error', action, duration || 6000);
  }

  warning(message: string, action?: string, duration?: number): void {
    this.show(message, 'warning', action, duration);
  }

  info(message: string, action?: string, duration?: number): void {
    this.show(message, 'info', action, duration);
  }

  private show(message: string, type: NotificationType, action?: string, duration?: number): void {
    const config: MatSnackBarConfig = {
      ...this.defaultConfig,
      duration: duration || this.defaultConfig.duration,
      panelClass: [`${type}-snackbar`]
    };

    // Add icon to message directly
    const iconMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const iconMessage = `${iconMap[type]} ${message}`;
    this.snackBar.open(iconMessage, action || 'Close', config);
  }

  // Specific notification methods for common scenarios
  bookingSuccess(): void {
    this.success('🎫 Booking confirmed successfully! Check your email for details.');
  }

  bookingCancelled(): void {
    this.warning('📧 Booking cancelled. Refund will be processed within 5-7 business days.');
  }

  eventCreated(): void {
    this.success('🎉 Event created successfully! Your event is now live.');
  }

  eventUpdated(): void {
    this.success('✏️ Event updated successfully!');
  }

  loginSuccess(userName: string): void {
    this.success(`👋 Welcome back, ${userName}!`);
  }

  logoutSuccess(): void {
    this.info('👋 You have been logged out successfully.');
  }

  networkError(): void {
    this.error('🌐 Network error. Please check your connection and try again.', 'Retry');
  }

  validationError(field: string): void {
    this.warning(`📝 Please check the ${field} field and try again.`);
  }

  permissionDenied(): void {
    this.error('🔒 You don\'t have permission to perform this action.');
  }

  emailSent(): void {
    this.success('📧 Email sent successfully!');
  }

  fileUploaded(): void {
    this.success('📁 File uploaded successfully!');
  }

  dataLoaded(): void {
    this.info('📊 Data loaded successfully.');
  }
}