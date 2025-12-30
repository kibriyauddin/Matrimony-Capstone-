import { Injectable, ErrorHandler } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {
  
  constructor(private notificationService: NotificationService) {}

  handleError(error: any): void {
    console.error('Global error caught:', error);

    // Handle different types of errors
    if (error?.status) {
      this.handleHttpError(error);
    } else if (error?.name === 'ChunkLoadError') {
      this.handleChunkLoadError();
    } else if (error?.message?.includes('Network')) {
      this.notificationService.networkError();
    } else {
      this.handleGenericError(error);
    }
  }

  private handleHttpError(error: any): void {
    switch (error.status) {
      case 401:
        this.notificationService.error('🔐 Session expired. Please login again.');
        // Redirect to login could be added here
        break;
      case 403:
        this.notificationService.permissionDenied();
        break;
      case 404:
        this.notificationService.error('📄 The requested resource was not found.');
        break;
      case 500:
        this.notificationService.error('🔧 Server error. Please try again later.');
        break;
      default:
        this.notificationService.error(`❌ Request failed (${error.status}). Please try again.`);
    }
  }

  private handleChunkLoadError(): void {
    this.notificationService.warning('🔄 App update available. Please refresh the page.', 'Refresh');
  }

  private handleGenericError(error: any): void {
    const message = error?.message || 'An unexpected error occurred';
    this.notificationService.error(`⚠️ ${message}`);
  }
}