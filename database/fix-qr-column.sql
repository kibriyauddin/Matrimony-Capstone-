-- Fix QR code column size issue
USE event_planner;
ALTER TABLE bookings MODIFY COLUMN qr_code TEXT;