export interface Booking {
  id: number;
  eventId: number;
  attendeeId: number;
  ticketsBooked: number;
  totalPrice: number;
  bookingTime: string;
  qrCode?: string;
}
