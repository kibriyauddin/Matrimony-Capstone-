const mysql = require('mysql2/promise');

async function checkUserEmail() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'gsrk@1234',
    database: 'event_planner'
  });

  try {
    // Check booking #10 details
    const [bookingRows] = await connection.execute(`
      SELECT b.id, b.attendee_id, u.name, u.email, b.tickets_booked, b.total_price 
      FROM bookings b 
      JOIN users u ON b.attendee_id = u.id 
      WHERE b.id = 10
    `);

    console.log('Booking #10 Details:');
    console.log(bookingRows[0]);

    // Check if we need to update the email
    if (bookingRows[0] && bookingRows[0].email === '3922064157@jklu.ac.in') {
      console.log('\nCurrent email looks incorrect. Would you like to update it?');
      console.log('Current email:', bookingRows[0].email);
      console.log('Suggested email: 99220041570@klu.ac.in');
      
      // Update the email
      await connection.execute(`
        UPDATE users 
        SET email = '99220041570@klu.ac.in' 
        WHERE id = ?
      `, [bookingRows[0].attendee_id]);
      
      console.log('✅ Email updated successfully!');
      
      // Verify the update
      const [updatedRows] = await connection.execute(`
        SELECT name, email FROM users WHERE id = ?
      `, [bookingRows[0].attendee_id]);
      
      console.log('Updated user details:', updatedRows[0]);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkUserEmail();