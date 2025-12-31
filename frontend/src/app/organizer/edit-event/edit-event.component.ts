import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EventService } from '../../services/event.service';
import { Event, CreateEventRequest } from '../../models/event.model';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.css'
})
export class EditEventComponent implements OnInit, OnDestroy {
  editEventForm!: FormGroup;
  categories: string[] = [];
  isLoading = false;
  isLoadingEvent = true;
  minDate = new Date();
  eventId!: number;
  currentEvent!: Event;
  
  // File upload properties
  uploadMethod: 'url' | 'file' = 'url';
  selectedFile: File | null = null;
  filePreviewUrl: string = '';
  uploadProgress: number = 0;
  uploadError: string = '';
  isDragOver: boolean = false;
  
  timeSlots = [
    { value: '00:00', display: '12:00 AM' },
    { value: '00:30', display: '12:30 AM' },
    { value: '01:00', display: '1:00 AM' },
    { value: '01:30', display: '1:30 AM' },
    { value: '02:00', display: '2:00 AM' },
    { value: '02:30', display: '2:30 AM' },
    { value: '03:00', display: '3:00 AM' },
    { value: '03:30', display: '3:30 AM' },
    { value: '04:00', display: '4:00 AM' },
    { value: '04:30', display: '4:30 AM' },
    { value: '05:00', display: '5:00 AM' },
    { value: '05:30', display: '5:30 AM' },
    { value: '06:00', display: '6:00 AM' },
    { value: '06:30', display: '6:30 AM' },
    { value: '07:00', display: '7:00 AM' },
    { value: '07:30', display: '7:30 AM' },
    { value: '08:00', display: '8:00 AM' },
    { value: '08:30', display: '8:30 AM' },
    { value: '09:00', display: '9:00 AM' },
    { value: '09:30', display: '9:30 AM' },
    { value: '10:00', display: '10:00 AM' },
    { value: '10:30', display: '10:30 AM' },
    { value: '11:00', display: '11:00 AM' },
    { value: '11:30', display: '11:30 AM' },
    { value: '12:00', display: '12:00 PM' },
    { value: '12:30', display: '12:30 PM' },
    { value: '13:00', display: '1:00 PM' },
    { value: '13:30', display: '1:30 PM' },
    { value: '14:00', display: '2:00 PM' },
    { value: '14:30', display: '2:30 PM' },
    { value: '15:00', display: '3:00 PM' },
    { value: '15:30', display: '3:30 PM' },
    { value: '16:00', display: '4:00 PM' },
    { value: '16:30', display: '4:30 PM' },
    { value: '17:00', display: '5:00 PM' },
    { value: '17:30', display: '5:30 PM' },
    { value: '18:00', display: '6:00 PM' },
    { value: '18:30', display: '6:30 PM' },
    { value: '19:00', display: '7:00 PM' },
    { value: '19:30', display: '7:30 PM' },
    { value: '20:00', display: '8:00 PM' },
    { value: '20:30', display: '8:30 PM' },
    { value: '21:00', display: '9:00 PM' },
    { value: '21:30', display: '9:30 PM' },
    { value: '22:00', display: '10:00 PM' },
    { value: '22:30', display: '10:30 PM' },
    { value: '23:00', display: '11:00 PM' },
    { value: '23:30', display: '11:30 PM' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    this.loadEventData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.editEventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      venue: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      date_time: ['', [Validators.required]],
      time: ['', [Validators.required]],
      category: ['', [Validators.required]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      ticket_price: ['', [Validators.required, Validators.min(0), Validators.max(10000)]],
      image_url: ['']
    });
  }

  private loadCategories(): void {
    this.categories = this.eventService.getCategories();
  }

  private loadEventData(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.eventId) {
      this.snackBar.open('Invalid event ID', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/organizer/dashboard']);
      return;
    }

    this.eventService.getEvent(this.eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          this.currentEvent = event;
          this.populateForm(event);
          this.isLoadingEvent = false;
        },
        error: (error) => {
          this.isLoadingEvent = false;
          this.snackBar.open('Failed to load event data', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/organizer/dashboard']);
        }
      });
  }

  private populateForm(event: Event): void {
    const eventDate = new Date(event.date_time);
    const timeString = eventDate.toTimeString().slice(0, 5); // HH:MM format

    this.editEventForm.patchValue({
      name: event.name,
      description: event.description || '',
      venue: event.venue,
      date_time: eventDate,
      time: timeString,
      category: event.category,
      capacity: event.capacity,
      ticket_price: event.ticket_price,
      image_url: event.image_url || ''
    });

    // Set upload method based on existing image
    if (event.image_url) {
      if (event.image_url.startsWith('data:')) {
        this.uploadMethod = 'file';
        this.filePreviewUrl = event.image_url;
      } else {
        this.uploadMethod = 'url';
      }
    } else {
      this.uploadMethod = 'url';
    }
  }

  // Custom validator for future dates
  private futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { pastDate: true };
  }

  // Getter methods for easy access to form controls
  get name() { return this.editEventForm.get('name'); }
  get description() { return this.editEventForm.get('description'); }
  get venue() { return this.editEventForm.get('venue'); }
  get date_time() { return this.editEventForm.get('date_time'); }
  get time() { return this.editEventForm.get('time'); }
  get category() { return this.editEventForm.get('category'); }
  get capacity() { return this.editEventForm.get('capacity'); }
  get ticket_price() { return this.editEventForm.get('ticket_price'); }
  get image_url() { return this.editEventForm.get('image_url'); }

  onSubmit(): void {
    if (this.editEventForm.valid) {
      this.isLoading = true;
      
      const formValue = this.editEventForm.value;
      
      // Combine date and time
      const eventDateTime = new Date(formValue.date_time);
      const [hours, minutes] = formValue.time.split(':');
      eventDateTime.setHours(parseInt(hours), parseInt(minutes));

      const eventData: Partial<CreateEventRequest> = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || '',
        venue: formValue.venue.trim(),
        date_time: eventDateTime.toISOString(),
        category: formValue.category,
        capacity: parseInt(formValue.capacity),
        ticket_price: parseFloat(formValue.ticket_price),
        image_url: this.getImageUrlForSubmission()
      };

      this.eventService.updateEvent(this.eventId, eventData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.snackBar.open('Event updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/organizer/dashboard']);
          },
          error: (error) => {
            this.isLoading = false;
            const errorMessage = error.error?.error || 'Failed to update event. Please try again.';
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  onCancel(): void {
    if (this.editEventForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Discard Changes?',
          message: 'You have unsaved changes. Are you sure you want to leave without saving?',
          confirmText: 'Discard',
          cancelText: 'Stay'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/organizer/dashboard']);
        }
      });
    } else {
      this.router.navigate(['/organizer/dashboard']);
    }
  }

  onDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Event?',
        message: `Are you sure you want to delete "${this.currentEvent.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteEvent();
      }
    });
  }

  private deleteEvent(): void {
    this.isLoading = true;
    
    this.eventService.cancelEvent(this.eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Event deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/organizer/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.error || 'Failed to delete event. Please try again.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editEventForm.controls).forEach(key => {
      const control = this.editEventForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper method to get error messages
  getErrorMessage(controlName: string): string {
    const control = this.editEventForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldDisplayName(controlName)} must be at least ${minLength} characters`;
    }
    
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `${this.getFieldDisplayName(controlName)} must not exceed ${maxLength} characters`;
    }
    
    if (control?.hasError('min')) {
      const min = control.errors?.['min'].min;
      return `${this.getFieldDisplayName(controlName)} must be at least ${min}`;
    }
    
    if (control?.hasError('max')) {
      const max = control.errors?.['max'].max;
      return `${this.getFieldDisplayName(controlName)} must not exceed ${max}`;
    }
    
    if (control?.hasError('pattern')) {
      return 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)';
    }
    
    return '';
  }

  private getFieldDisplayName(controlName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Event name',
      description: 'Description',
      venue: 'Venue',
      date_time: 'Event date',
      time: 'Event time',
      category: 'Category',
      capacity: 'Capacity',
      ticket_price: 'Ticket price',
      image_url: 'Image URL'
    };
    
    return displayNames[controlName] || controlName;
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Music': 'music_note',
      'Workshop': 'school',
      'Conference': 'business',
      'Sports': 'sports',
      'Other': 'category'
    };
    return icons[category] || 'category';
  }

  getTimeDisplay(timeValue: string): string {
    if (!timeValue) return '';
    const timeSlot = this.timeSlots.find(slot => slot.value === timeValue);
    return timeSlot ? timeSlot.display : timeValue;
  }

  getFormattedTime(): string {
    const timeValue = this.editEventForm.get('time')?.value;
    if (!timeValue) return '';
    
    const timeSlot = this.timeSlots.find(slot => slot.value === timeValue);
    return timeSlot ? timeSlot.display : timeValue;
  }

  // File upload methods
  setUploadMethod(method: 'url' | 'file'): void {
    this.uploadMethod = method;
    this.uploadError = '';
    
    if (method === 'url') {
      // Clear file selection when switching to URL
      this.selectedFile = null;
      this.filePreviewUrl = '';
      this.uploadProgress = 0;
    } else {
      // Clear URL when switching to file upload
      this.editEventForm.patchValue({ image_url: '' });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  private handleFileSelection(file: File): void {
    this.uploadError = '';
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError = 'Please select a valid image file (JPG, PNG, GIF, WebP)';
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      this.uploadError = 'File size must be less than 5MB';
      return;
    }

    this.selectedFile = file;
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.filePreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Simulate upload progress (in a real app, this would be actual upload)
    this.simulateUpload();
  }

  private simulateUpload(): void {
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        // Update the form with the base64 image data
        this.editEventForm.patchValue({ image_url: this.filePreviewUrl });
        
        // Show success message
        this.snackBar.open('Image uploaded successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        setTimeout(() => {
          this.uploadProgress = 0;
        }, 500);
      }
    }, 100);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreviewUrl = '';
    this.uploadProgress = 0;
    this.uploadError = '';
    this.editEventForm.patchValue({ image_url: '' });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  hasPreviewImage(): boolean {
    return (this.uploadMethod === 'file' && !!this.filePreviewUrl) || 
           (this.uploadMethod === 'url' && !!this.editEventForm.value.image_url);
  }

  getPreviewImageUrl(): string {
    // If we have a selected file, use its preview URL
    if (this.uploadMethod === 'file' && this.filePreviewUrl) {
      return `url(${this.filePreviewUrl})`;
    }
    
    // Otherwise use the URL input
    const imageUrl = this.editEventForm.value.image_url;
    return imageUrl ? `url(${imageUrl})` : '';
  }

  private getImageUrlForSubmission(): string | null {
    if (this.uploadMethod === 'file' && this.filePreviewUrl) {
      // Now that the database supports LONGTEXT, we can store base64 images
      return this.filePreviewUrl;
    }
    
    const urlValue = this.editEventForm.value.image_url?.trim();
    return urlValue || null;
  }
}

// Confirmation Dialog Component
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header" [class.destructive]="data.isDestructive">
        <mat-icon>{{ data.isDestructive ? 'warning' : 'help' }}</mat-icon>
        <h2>{{ data.title }}</h2>
      </div>
      
      <div class="dialog-content">
        <p>{{ data.message }}</p>
      </div>
      
      <div class="dialog-actions">
        <button mat-button (click)="onCancel()">{{ data.cancelText }}</button>
        <button mat-raised-button 
                [color]="data.isDestructive ? 'warn' : 'primary'"
                (click)="onConfirm()">
          {{ data.confirmText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .dialog-header.destructive {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 1.2em;
      font-weight: 500;
    }
    
    .dialog-content {
      padding: 20px 24px;
    }
    
    .dialog-content p {
      margin: 0;
      line-height: 1.5;
      color: #666;
    }
    
    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 24px;
      background-color: #fafafa;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
