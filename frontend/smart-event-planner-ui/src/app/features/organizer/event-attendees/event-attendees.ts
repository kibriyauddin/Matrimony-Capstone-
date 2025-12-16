import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ IMPORTANT
import { EventService } from '../../../core/services/event.service';
import { EventAttendeesResponse } from '../../../shared/models/event-attendees.model';

@Component({
  standalone: true,
  selector: 'app-event-attendees',
  templateUrl: './event-attendees.html',
  imports: [CommonModule] // ✅ THIS LINE FIXES 70% OF YOUR ISSUE
})
export class EventAttendeesComponent implements OnInit {
  data?: EventAttendeesResponse;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));

    this.eventService.getEventAttendees(eventId).subscribe(res => {
      console.log('API DATA:', res);
      this.data = res;
    });
  }
}
