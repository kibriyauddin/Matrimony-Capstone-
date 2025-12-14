import pool from '../config/database';
export const fetchEvents = async (filters: any) => {
  let query = 'SELECT * FROM events WHERE 1=1';
  const params: any[] = [];

  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.venue) {
    query += ' AND venue = ?';
    params.push(filters.venue);
  }

  if (filters.date) {
    query += ' AND DATE(date_time) = ?';
    params.push(filters.date);
  }

  const [rows] = await pool.query(query, params);
  return rows;
};

export const fetchEventAttendees = async (eventId: number) => {
  // 1️⃣ Get event info
  const [eventRows]: any = await pool.query(
    'SELECT id, name, capacity FROM events WHERE id = ?',
    [eventId]
  );

  if (eventRows.length === 0) {
    throw new Error('Event not found');
  }

  // 2️⃣ Get attendees + tickets
  const [attendeeRows]: any = await pool.query(
    `SELECT 
        attendee_id,
        tickets_booked,
        booking_time
     FROM bookings
     WHERE event_id = ?`,
    [eventId]
  );

  // 3️⃣ Calculate totals
  const totalBooked = attendeeRows.reduce(
    (sum: number, row: any) => sum + row.tickets_booked,
    0
  );

  return {
    event: eventRows[0],
    totalBooked,
    remainingSeats: eventRows[0].capacity - totalBooked,
    attendees: attendeeRows
  };
};
