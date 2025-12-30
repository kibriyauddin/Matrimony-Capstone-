-- Smart Event Planner Database Schema

CREATE DATABASE IF NOT EXISTS event_planner;
USE event_planner;

-- Users table for authentication and role management
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('attendee', 'organizer', 'admin') DEFAULT 'attendee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organizer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(255) NOT NULL,
    date_time DATETIME NOT NULL,
    category ENUM('Music', 'Workshop', 'Conference', 'Sports', 'Other') NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    ticket_price DECIMAL(10, 2) DEFAULT 0.00,
    image_url LONGTEXT,
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_date_time (date_time),
    INDEX idx_category (category),
    INDEX idx_organizer (organizer_id)
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    attendee_id INT NOT NULL,
    tickets_booked INT NOT NULL CHECK (tickets_booked > 0),
    total_price DECIMAL(10, 2) NOT NULL,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qr_code VARCHAR(255) UNIQUE,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (attendee_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event (event_id),
    INDEX idx_attendee (attendee_id),
    INDEX idx_qr_code (qr_code)
);

-- Insert sample admin user
INSERT INTO users (email, password, name, role) VALUES 
('admin@eventplanner.com', '$2b$10$example_hashed_password', 'Admin User', 'admin');