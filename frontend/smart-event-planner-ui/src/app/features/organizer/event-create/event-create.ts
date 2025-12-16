import { Component } from '@angular/core';
import {
  NonNullableFormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { EventService } from '../../../core/services/event.service';

@Component({
  standalone: true,
  selector: 'app-event-create',
  templateUrl: './event-create.html',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class EventCreateComponent {

  eventForm;

  constructor(
    private fb: NonNullableFormBuilder,
    private eventService: EventService,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      venue: ['', Validators.required],
      category: ['', Validators.required],
      capacity: [1, [Validators.required, Validators.min(1)]],
      date_time: ['', Validators.required]
    });
  }

  submit(): void {
  if (this.eventForm.invalid) return;

  const raw = this.eventForm.getRawValue();

  const payload = {
  organizer_id: 1, // 🔥 TEMP (later from auth/JWT)
  ...this.eventForm.getRawValue(),
  date_time: new Date(
    this.eventForm.getRawValue().date_time
  ).toISOString().slice(0, 19).replace('T', ' ')
};


  this.eventService.createEvent(payload).subscribe({
    next: () => this.router.navigate(['/organizer/dashboard']),
    error: err => console.error('Create event failed', err)
  });
}
}