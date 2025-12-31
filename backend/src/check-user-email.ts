import { pool } from './config/database';
import { RowDataPacket } from 'mysql2';

interface BookingDetails extends RowDataPacket {
  id: number;
  attendee_id: number;
  name: string;
  email: string;
  tickets_booked: number;
  total_price: number;
}

interface UserDetails extends RowDataPacket {
  name: string;
  email: string;
}

async function checkAndUpdateUserEmail(): Promise<void> {
  try {
    // Check booking #10 details
    const [bookingRows] = await pool.execute<BookingDetails[]>(`
      SELECT b.id, b.attendee_id, u.name, u.email, b.tickets_booked, b.total_price 
      FROM bookings b 
      JOIN users u ON b.attendee_id = u.id 
      WHERE b.id = 10
    `);

    if (bookingRows.length === 0) {
      console.log('❌ Booking #10 not found');
      return;
    }

    const booking = bookingRows[0];
    console.log('📋 Booking #10 Details:');
    console.log(`   ID: ${booking.id}`);
    console.log(`   Attendee ID: ${booking.attendee_id}`);
    console.log(`   Name: ${booking.name}`);
    console.log(`   Current Email: ${booking.email}`);
    console.log(`   Tickets: ${booking.tickets_booked}`);
    console.log(`   Amount: ₹${booking.total_price}`);

    // Check if email needs updating
    if (booking.email === '3922064157@jklu.ac.in') {
      console.log('\n🔧 Current email looks incorrect. Updating...');
      console.log(`   From: ${booking.email}`);
      console.log(`   To: 99220041570@klu.ac.in`);
      
      // Update the email
      await pool.execute(`
        UPDATE users 
        SET email = ? 
        WHERE id = ?
      `, ['99220041570@klu.ac.in', booking.attendee_id]);
      
      console.log('✅ Email updated successfully!');
      
      // Verify the update
      const [updatedRows] = await pool.execute<UserDetails[]>(`
        SELECT name, email FROM users WHERE id = ?
      `, [booking.attendee_id]);
      
      if (updatedRows.length > 0) {
        console.log('\n📧 Updated user details:');
        console.log(`   Name: ${updatedRows[0].name}`);
        console.log(`   Email: ${updatedRows[0].email}`);
      }
    } else {
      console.log('\n✅ Email looks correct, no update needed');
    }

    // Show all users for reference
    console.log('\n👥 All users in database:');
    const [allUsers] = await pool.execute<UserDetails[]>(`
      SELECT id, name, email, role FROM users ORDER BY id
    `);
    
    allUsers.forEach(user => {
      console.log(`   ${(user as any).id}: ${user.name} (${user.email}) - ${(user as any).role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
checkAndUpdateUserEmail();