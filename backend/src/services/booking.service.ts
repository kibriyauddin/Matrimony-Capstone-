import pool from '../config/database';

export const bookTickets = async (data: any) => {
  const { event_id, attendee_id, tickets } = data;

  if (!event_id || !attendee_id || tickets <= 0) {
    throw new Error('Invalid booking data');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Get event capacity
    const [eventRows]: any = await connection.query(
      'SELECT capacity FROM events WHERE id = ? FOR UPDATE',
      [event_id]
    );

    if (eventRows.length === 0) {
      throw new Error('Event not found');
    }

    const capacity = eventRows[0].capacity;

    // 2️⃣ Calculate already booked seats
    const [bookingRows]: any = await connection.query(
      'SELECT SUM(tickets_booked) as booked FROM bookings WHERE event_id = ?',
      [event_id]
    );

    const bookedSeats = bookingRows[0].booked || 0;
    const availableSeats = capacity - bookedSeats;

    if (tickets > availableSeats) {
      throw new Error('Not enough seats available');
    }

    // 3️⃣ Insert booking
    const [result]: any = await connection.query(
      `INSERT INTO bookings (event_id, attendee_id, tickets_booked, total_price, booking_time)
       VALUES (?, ?, ?, ?, NOW())`,
      [event_id, attendee_id, tickets, tickets * 500] // example price
    );

    await connection.commit();
    return result;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
