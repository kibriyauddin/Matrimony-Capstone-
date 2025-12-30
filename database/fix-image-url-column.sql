-- Fix image_url column to support base64 data URLs
USE event_planner;

-- Change image_url column from VARCHAR(500) to LONGTEXT to support base64 images
ALTER TABLE events MODIFY COLUMN image_url LONGTEXT;