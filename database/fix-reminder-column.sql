-- Add reminder_sent column to bookings table
USE event_planner;

-- Check if column exists and add it if it doesn't
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = 'event_planner' 
AND table_name = 'bookings' 
AND column_name = 'reminder_sent';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE bookings ADD COLUMN reminder_sent TINYINT(1) DEFAULT 0', 
    'SELECT "Column reminder_sent already exists" as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;