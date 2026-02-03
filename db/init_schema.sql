-- =============================================
-- RVCE Alumni Portal Database Schema
-- Database: alumnirvce
-- ONE-TIME SETUP ONLY - Creates database and tables
-- =============================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS alumnirvce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alumnirvce;

-- =============================================
-- Table: admin
-- =============================================
CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: alumni
-- =============================================
CREATE TABLE IF NOT EXISTS alumni (
    alumni_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    graduation_year INT NOT NULL,
    company VARCHAR(100),
    field VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_branch (branch),
    INDEX idx_graduation_year (graduation_year),
    INDEX idx_verified (verified),
    CHECK (graduation_year >= 1950 AND graduation_year <= 2100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: alumni_contact
-- =============================================
CREATE TABLE IF NOT EXISTS alumni_contact (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    alumni_id INT NOT NULL,
    phone VARCHAR(15),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE,
    INDEX idx_alumni_id (alumni_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: alumni_location
-- =============================================
CREATE TABLE IF NOT EXISTS alumni_location (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    alumni_id INT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE,
    INDEX idx_alumni_id (alumni_id),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: job_posting
-- =============================================
CREATE TABLE IF NOT EXISTS job_posting (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    posted_by INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    required_branch VARCHAR(50),
    required_field VARCHAR(100),
    status ENUM('active', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES alumni(alumni_id) ON DELETE CASCADE,
    INDEX idx_posted_by (posted_by),
    INDEX idx_status (status),
    INDEX idx_company (company),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: event
-- =============================================
CREATE TABLE IF NOT EXISTS event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin(admin_id) ON DELETE SET NULL,
    INDEX idx_event_date (event_date),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: event_participation (M:N relationship)
-- =============================================
CREATE TABLE IF NOT EXISTS event_participation (
    participation_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    alumni_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE,
    UNIQUE KEY unique_participation (event_id, alumni_id),
    INDEX idx_event_id (event_id),
    INDEX idx_alumni_id (alumni_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: mentorship
-- =============================================
CREATE TABLE IF NOT EXISTS mentorship (
    mentorship_id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id INT NOT NULL,
    mentee_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE,
    INDEX idx_mentor_id (mentor_id),
    INDEX idx_mentee_id (mentee_id),
    INDEX idx_status (status),
    CHECK (mentor_id <> mentee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger to prevent self-mentorship
DROP TRIGGER IF EXISTS prevent_self_mentorship;
DELIMITER //
CREATE TRIGGER prevent_self_mentorship
BEFORE INSERT ON mentorship
FOR EACH ROW
BEGIN
    IF NEW.mentor_id = NEW.mentee_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Alumni cannot mentor themselves';
    END IF;
END//
DELIMITER ;

-- =============================================
-- Table: message
-- =============================================
CREATE TABLE IF NOT EXISTS message (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_read_status (read_status),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
