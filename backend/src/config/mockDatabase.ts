// Mock database for demonstration purposes
// In production, use MySQL as specified in the original design

export interface MockUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'attendee' | 'organizer';
  created_at: Date;
}

export interface MockEvent {
  id: number;
  organizer_id: number;
  name: string;
  description?: string;
  venue: string;
  date_time: Date;
  category: 'Music' | 'Workshop' | 'Conference' | 'Sports' | 'Technology' | 'Business' | 'Arts & Culture' | 'Food & Drink' | 'Health & Wellness' | 'Education' | 'Entertainment' | 'Networking' | 'Charity' | 'Fashion' | 'Travel' | 'Other';
  capacity: number;
  ticket_price: number;
  image_url?: string;
  status: 'active' | 'cancelled' | 'completed';
  created_at: Date;
}

export interface MockBooking {
  id: number;
  event_id: number;
  attendee_id: number;
  tickets_booked: number;
  total_price: number;
  booking_time: Date;
  qr_code: string;
  status: 'confirmed' | 'cancelled';
}

class MockDatabase {
  private users: MockUser[] = [];

  private events: MockEvent[] = [
    {
      id: 1,
      organizer_id: 1,
      name: 'Tech Conference 2024',
      description: 'Annual technology conference featuring the latest innovations',
      venue: 'Convention Center',
      date_time: new Date('2024-12-31T10:00:00'),
      category: 'Conference',
      capacity: 500,
      ticket_price: 99.99,
      status: 'active',
      created_at: new Date()
    },
    {
      id: 2,
      organizer_id: 1,
      name: 'Music Festival',
      description: 'Three-day music festival with top artists',
      venue: 'City Park',
      date_time: new Date('2024-12-25T18:00:00'),
      category: 'Music',
      capacity: 1000,
      ticket_price: 149.99,
      status: 'active',
      created_at: new Date()
    }
  ];

  private bookings: MockBooking[] = [];
  private nextUserId = 2;
  private nextEventId = 3;
  private nextBookingId = 1;

  // User methods
  async findUserByEmail(email: string): Promise<MockUser | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findUserById(id: number): Promise<MockUser | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<MockUser, 'id' | 'created_at'>): Promise<MockUser> {
    const newUser: MockUser = {
      ...userData,
      id: this.nextUserId++,
      created_at: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async getAllUsers(): Promise<MockUser[]> {
    return this.users.map(user => ({ ...user, password: '' })); // Don't return passwords
  }

  // Event methods
  async getAllEvents(): Promise<any[]> {
    return this.events.map(event => {
      const organizer = this.users.find(u => u.id === event.organizer_id);
      const bookedTickets = this.bookings
        .filter(b => b.event_id === event.id && b.status === 'confirmed')
        .reduce((sum, b) => sum + b.tickets_booked, 0);
      
      return {
        ...event,
        organizer_name: organizer?.name || 'Unknown',
        available_tickets: event.capacity - bookedTickets
      };
    });
  }

  async findEventById(id: number): Promise<any | null> {
    const event = this.events.find(e => e.id === id);
    if (!event) return null;

    const organizer = this.users.find(u => u.id === event.organizer_id);
    const bookedTickets = this.bookings
      .filter(b => b.event_id === event.id && b.status === 'confirmed')
      .reduce((sum, b) => sum + b.tickets_booked, 0);

    return {
      ...event,
      organizer_name: organizer?.name || 'Unknown',
      available_tickets: event.capacity - bookedTickets
    };
  }

  async createEvent(eventData: Omit<MockEvent, 'id' | 'created_at'>): Promise<number> {
    const newEvent: MockEvent = {
      ...eventData,
      id: this.nextEventId++,
      created_at: new Date()
    };
    this.events.push(newEvent);
    return newEvent.id;
  }

  async updateEvent(id: number, updates: Partial<MockEvent>): Promise<boolean> {
    const eventIndex = this.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return false;

    this.events[eventIndex] = { ...this.events[eventIndex], ...updates };
    return true;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const eventIndex = this.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return false;

    this.events[eventIndex].status = 'cancelled';
    return true;
  }

  async cancelEvent(id: number): Promise<boolean> {
    const eventIndex = this.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return false;

    this.events[eventIndex].status = 'cancelled';
    return true;
  }

  async getEventsByOrganizer(organizerId: number): Promise<any[]> {
    return this.events
      .filter(e => e.organizer_id === organizerId)
      .map(event => {
        const bookedTickets = this.bookings
          .filter(b => b.event_id === event.id && b.status === 'confirmed')
          .reduce((sum, b) => sum + b.tickets_booked, 0);
        
        return {
          ...event,
          tickets_sold: bookedTickets,
          available_tickets: event.capacity - bookedTickets
        };
      });
  }

  // Booking methods
  async createBooking(bookingData: Omit<MockBooking, 'id' | 'booking_time'>): Promise<number> {
    const newBooking: MockBooking = {
      ...bookingData,
      id: this.nextBookingId++,
      booking_time: new Date()
    };
    this.bookings.push(newBooking);
    return newBooking.id;
  }

  async getBookingsByUser(userId: number): Promise<any[]> {
    return this.bookings
      .filter(b => b.attendee_id === userId)
      .map(booking => {
        const event = this.events.find(e => e.id === booking.event_id);
        return {
          ...booking,
          event_name: event?.name || 'Unknown Event',
          venue: event?.venue || 'Unknown Venue',
          event_date: event?.date_time || new Date()
        };
      });
  }

  async findBookingById(id: number): Promise<any | null> {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return null;

    const event = this.events.find(e => e.id === booking.event_id);
    const attendee = this.users.find(u => u.id === booking.attendee_id);

    return {
      ...booking,
      event_name: event?.name || 'Unknown Event',
      venue: event?.venue || 'Unknown Venue',
      event_date: event?.date_time || new Date(),
      attendee_name: attendee?.name || 'Unknown User'
    };
  }

  async cancelBooking(id: number): Promise<boolean> {
    const bookingIndex = this.bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) return false;

    this.bookings[bookingIndex].status = 'cancelled';
    return true;
  }

  async getEventAttendees(eventId: number): Promise<any[]> {
    return this.bookings
      .filter(b => b.event_id === eventId)
      .map(booking => {
        const attendee = this.users.find(u => u.id === booking.attendee_id);
        return {
          ...booking,
          attendee_name: attendee?.name || 'Unknown User',
          attendee_email: attendee?.email || 'unknown@email.com'
        };
      });
  }
}

export const mockDb = new MockDatabase();