import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { CreateEventRequest } from '../../models/event.model';

@Component({
  selector: 'app-create-event',
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
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css'
})
export class CreateEventComponent implements OnInit, OnDestroy {
  createEventForm!: FormGroup;
  categories: string[] = [];
  isLoading = false;
  minDate = new Date();
  
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
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.createEventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      venue: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      date_time: ['', [Validators.required, this.futureDateValidator]],
      time: ['', [Validators.required]],
      category: ['', [Validators.required]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(10000), this.integerValidator]],
      ticket_price: ['', [Validators.required, Validators.min(0), Validators.max(100000), this.numberValidator]],
      image_url: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]]
    });
  }

  private loadCategories(): void {
    this.categories = this.eventService.getCategories();
  }

  // Custom validator for future dates
  private futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { pastDate: true };
  }

  // Custom validator for integers
  private integerValidator(control: any) {
    if (!control.value) return null;
    
    const value = parseInt(control.value);
    return !isNaN(value) && Number.isInteger(value) ? null : { notInteger: true };
  }

  // Custom validator for numbers
  private numberValidator(control: any) {
    if (!control.value) return null;
    
    const value = parseFloat(control.value);
    return !isNaN(value) ? null : { notNumber: true };
  }

  // Getter methods for easy access to form controls
  get name() { return this.createEventForm.get('name'); }
  get description() { return this.createEventForm.get('description'); }
  get venue() { return this.createEventForm.get('venue'); }
  get date_time() { return this.createEventForm.get('date_time'); }
  get time() { return this.createEventForm.get('time'); }
  get category() { return this.createEventForm.get('category'); }
  get capacity() { return this.createEventForm.get('capacity'); }
  get ticket_price() { return this.createEventForm.get('ticket_price'); }
  get image_url() { return this.createEventForm.get('image_url'); }

  onSubmit(): void {
    console.log('Form submission attempted');
    console.log('Form valid:', this.createEventForm.valid);
    console.log('Form value:', this.createEventForm.value);
    
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched();
    
    if (this.createEventForm.valid) {
      this.isLoading = true;
      
      const formValue = this.createEventForm.value;
      
      // Validate required fields explicitly
      if (!formValue.name?.trim() || !formValue.venue?.trim() || !formValue.date_time || !formValue.time || !formValue.category) {
        this.isLoading = false;
        this.snackBar.open('Please fill in all required fields.', 'Close', {
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      // Validate and convert numeric fields
      const capacity = parseInt(formValue.capacity);
      const ticketPrice = parseFloat(formValue.ticket_price);
      
      if (isNaN(capacity) || capacity < 1) {
        this.isLoading = false;
        this.snackBar.open('Please enter a valid capacity (minimum 1).', 'Close', {
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      if (isNaN(ticketPrice) || ticketPrice < 0) {
        this.isLoading = false;
        this.snackBar.open('Please enter a valid ticket price (minimum 0).', 'Close', {
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
        return;
      }
      
      // Combine date and time properly
      const eventDate = new Date(formValue.date_time);
      const [hours, minutes] = formValue.time.split(':');
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Ensure the date is in the future
      const now = new Date();
      if (eventDate <= now) {
        this.isLoading = false;
        this.snackBar.open('Event date and time must be in the future.', 'Close', {
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      // Get image URL for submission
      let imageUrl = null;
      if (this.uploadMethod === 'file' && this.filePreviewUrl) {
        imageUrl = this.filePreviewUrl;
      } else if (this.uploadMethod === 'url' && formValue.image_url?.trim()) {
        imageUrl = formValue.image_url.trim();
      }

      const eventData: CreateEventRequest = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || '',
        venue: formValue.venue.trim(),
        date_time: eventDate.toISOString(),
        category: formValue.category,
        capacity: capacity,
        ticket_price: ticketPrice,
        image_url: imageUrl
      };

      console.log('Event data to submit:', eventData);

      this.eventService.createEvent(eventData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.snackBar.open('Event created successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/organizer/dashboard']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Event creation error:', error);
            
            // Handle specific validation errors from backend
            let errorMessage = 'Failed to create event. Please try again.';
            
            if (error.error?.details && Array.isArray(error.error.details)) {
              errorMessage = `Validation Error: ${error.error.details.join(', ')}`;
            } else if (error.error?.error) {
              errorMessage = error.error.error;
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            this.snackBar.open(errorMessage, 'Close', {
              duration: 8000,
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      // Get specific validation errors
      const errors = this.getValidationErrors();
      console.log('Form validation errors:', errors);
      console.log('Form errors object:', this.getFormErrors());
      
      const errorMessage = errors.length > 0 
        ? `Please fix: ${errors.join(', ')}`
        : 'Please fill in all required fields correctly.';
      
      this.snackBar.open(errorMessage, 'Close', {
        duration: 8000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  private getFormErrors(): any {
    const formErrors: any = {};
    Object.keys(this.createEventForm.controls).forEach(key => {
      const controlErrors = this.createEventForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  private getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (this.name?.invalid && this.name?.touched) {
      if (this.name.hasError('required')) errors.push('Event name is required');
      if (this.name.hasError('minlength')) errors.push('Event name too short');
    }
    
    if (this.venue?.invalid && this.venue?.touched) {
      if (this.venue.hasError('required')) errors.push('Venue is required');
      if (this.venue.hasError('minlength')) errors.push('Venue name too short');
    }
    
    if (this.date_time?.invalid && this.date_time?.touched) {
      if (this.date_time.hasError('required')) errors.push('Event date is required');
      if (this.date_time.hasError('pastDate')) errors.push('Event date must be in the future');
    }
    
    if (this.time?.invalid && this.time?.touched) {
      if (this.time.hasError('required')) errors.push('Event time is required');
    }
    
    if (this.category?.invalid && this.category?.touched) {
      if (this.category.hasError('required')) errors.push('Category is required');
    }
    
    if (this.capacity?.invalid && this.capacity?.touched) {
      if (this.capacity.hasError('required')) errors.push('Capacity is required');
      if (this.capacity.hasError('min')) errors.push('Capacity must be at least 1');
    }
    
    if (this.ticket_price?.invalid && this.ticket_price?.touched) {
      if (this.ticket_price.hasError('required')) errors.push('Ticket price is required');
      if (this.ticket_price.hasError('min')) errors.push('Ticket price cannot be negative');
    }
    
    return errors;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createEventForm.controls).forEach(key => {
      const control = this.createEventForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/organizer/dashboard']);
  }

  // Helper method to get error messages
  getErrorMessage(controlName: string): string {
    const control = this.createEventForm.get(controlName);
    
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
    
    if (control?.hasError('pastDate')) {
      return 'Event date must be in the future';
    }
    
    if (control?.hasError('notInteger')) {
      return `${this.getFieldDisplayName(controlName)} must be a whole number`;
    }
    
    if (control?.hasError('notNumber')) {
      return `${this.getFieldDisplayName(controlName)} must be a valid number`;
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

  hasPreviewImage(): boolean {
    return (this.uploadMethod === 'file' && !!this.filePreviewUrl) || 
           (this.uploadMethod === 'url' && !!this.createEventForm.value.image_url);
  }

  getPreviewImageUrl(): string {
    // If we have a selected file, use its preview URL
    if (this.uploadMethod === 'file' && this.filePreviewUrl) {
      return `url(${this.filePreviewUrl})`;
    }
    
    // Otherwise use the URL input
    const imageUrl = this.createEventForm.value.image_url;
    return imageUrl ? `url(${imageUrl})` : '';
  }

  getTimeDisplay(timeValue: string): string {
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
      this.createEventForm.patchValue({ image_url: '' });
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
        this.createEventForm.patchValue({ image_url: this.filePreviewUrl });
        
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
    this.createEventForm.patchValue({ image_url: '' });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
