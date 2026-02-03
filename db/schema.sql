-- =============================================
-- RVCE Alumni Portal Database Schema
-- Database: alumnirvce
-- SAFE VERSION - Keeps your registered alumni!
-- =============================================

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
-- ==========IF NOT EXISTS ===================================
CREATE TABLE message (
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

-- =============================================
-- Sample Data: Admin Accounts
-- =============================================
-- Password for all: admin123 (bcrypt hash with salt rounds=10)
INSERT IGNORE INTO admin (name, email, password_hash) VALUES
('Dr. Rajesh Kumar', 'admin@rvce.edu.in', '$2b$10$Mhlq0wwgB0YDZfaiGdezsu1ZB.Mc8HulfxowgU1xgYjhCUUNHRPve'),
('Prof. Anita Sharma', 'anita.sharma@rvce.edu.in', '$2b$10$Mhlq0wwgB0YDZfaiGdezsu1ZB.Mc8HulfxowgU1xgYjhCUUNHRPve');

-- =============================================
-- Sample Data: 5 RVCE Alumni
-- =============================================
-- Password for all: alumni123 (bcrypt hash)
INSERT IGNORE INTO alumni (name, email, password_hash, branch, graduation_year, company, field, verified) VALUES
('Arjun Reddy', 'arjun.reddy@nvidia.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'ISE', 2018, 'Nvidia', 'Artificial Intelligence', TRUE),
('Priya Menon', 'priya.menon@google.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'CSE', 2019, 'Google', 'Software Engineering', TRUE),
('Vikram Singh', 'vikram.singh@amazon.in', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'ECE', 2017, 'Amazon', 'Cloud Computing', TRUE),
('Sneha Patel', 'sneha.patel@microsoft.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'ISE', 2020, 'Microsoft', 'Machine Learning', TRUE),
('Rahul Iyer', 'rahul.iyer@flipkart.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'CSE', 2016, 'Flipkart', 'Full Stack Development', TRUE);

-- =============================================
-- Sample Data: Alumni Contacts
-- =============================================
INSERT INTO alumni_contact (alumni_id, phone, linkedin_url, github_url) VALUES
(1, '+919876543210', 'https://linkedin.com/in/arjunreddy', 'https://github.com/arjunreddy'),
(2, '+919876543211', 'https://linkedin.com/in/priyamenon', 'https://github.com/priyamenon'),
(3, '+919876543212', 'https://linkedin.com/in/vikramsingh', 'https://github.com/vikramsingh'),
(4, '+919876543213', 'https://linkedin.com/in/snehapatel', 'https://github.com/snehapatel'),
(5, '+919876543214', 'https://linkedin.com/in/rahuliyer', 'https://github.com/rahuliyer');

-- =============================================
-- Sample Data: Alumni Locations (All Bengaluru)
-- =============================================
INSERT INTO alumni_location (alumni_id, city, state, country) VALUES
(1, 'Bengaluru', 'Karnataka', 'India'),
(2, 'Bengaluru', 'Karnataka', 'India'),
(3, 'Bengaluru', 'Karnataka', 'India'),
(4, 'Bengaluru', 'Karnataka', 'India'),
(5, 'Bengaluru', 'Karnataka', 'India');

-- =============================================
-- Sample Data: Job Postings
-- =============================================
INSERT INTO job_posting (posted_by, title, company, location, description, required_branch, required_field, status) VALUES
(1, 'Senior AI Engineer', 'Nvidia', 'Bengaluru', 'Looking for experienced AI engineer to work on GPU-accelerated deep learning frameworks.', 'CSE,ISE', 'Artificial Intelligence', 'active'),
(2, 'Software Development Engineer - II', 'Google', 'Bengaluru', 'Work on large-scale distributed systems and cloud infrastructure.', 'CSE,ISE,ECE', 'Software Engineering', 'active'),
(3, 'Cloud Solutions Architect', 'Amazon', 'Bengaluru', 'Design and implement cloud-native solutions for enterprise clients.', 'CSE,ECE', 'Cloud Computing', 'active'),
(4, 'Machine Learning Engineer', 'Microsoft', 'Hyderabad', 'Build and deploy ML models for Azure AI services.', 'ISE,CSE', 'Machine Learning', 'active'),
(5, 'Full Stack Developer', 'Flipkart', 'Bengaluru', 'Develop and maintain e-commerce platform features.', 'CSE,ISE', 'Full Stack Development', 'closed');

-- =============================================
-- Sample Data: Events
-- =============================================
INSERT INTO event (name, description, event_date, location, created_by) VALUES
('RVCE Alumni Meet 2026', 'Annual reunion of RVCE alumni with networking and cultural programs.', '2026-03-15', 'RVCE Campus, Bengaluru', 1),
('Tech Talk: Future of AI', 'Industry experts discuss the future trends in artificial intelligence.', '2026-04-20', 'RVCE Auditorium, Bengaluru', 1),
('Career Fair 2026', 'Top companies recruiting fresh graduates and experienced professionals.', '2026-05-10', 'RVCE Ground, Bengaluru', 2),
('Startup Pitch Day', 'Alumni entrepreneurs pitch their startups to investors and mentors.', '2026-06-15', 'RVCE Seminar Hall, Bengaluru', 1),
('Sports Day', 'Cricket, football, and badminton tournaments for alumni.', '2026-07-25', 'RVCE Sports Complex, Bengaluru', 2);

-- =============================================
-- Sample Data: Event Participation
-- =============================================
INSERT INTO event_participation (event_id, alumni_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 4),
(3, 2), (3, 3), (3, 5),
(4, 1), (4, 5),
(5, 3), (5, 4);

-- =============================================
-- Sample Data: Mentorship Requests
-- =============================================
INSERT INTO mentorship (mentor_id, mentee_id, status) VALUES
(1, 4, 'accepted'),  -- Arjun mentoring Sneha (both ISE, AI/ML fields)
(2, 5, 'accepted'),  -- Priya mentoring Rahul (both CSE)
(3, 4, 'pending'),   -- Vikram mentoring Sneha (ECE to ISE)
(1, 5, 'rejected'),  -- Arjun rejected Rahul
(2, 1, 'pending');   -- Priya requested mentorship from Arjun

-- =============================================
-- Sample Data: Messages
-- =============================================
INSERT INTO message (sender_id, receiver_id, subject, body, read_status) VALUES
(1, 2, 'Collaboration Opportunity', 'Hi Priya, I am working on an AI project at Nvidia. Would love to collaborate with Google teams. Let me know if interested.', TRUE),
(2, 1, 'RE: Collaboration Opportunity', 'Hi Arjun, That sounds exciting! Let us schedule a call next week to discuss this.', TRUE),
(4, 1, 'Thank you for mentorship', 'Hi Arjun, Thank you for accepting my mentorship request. Looking forward to learning from you.', FALSE),
(5, 2, 'Question about Google interview', 'Hi Priya, I have an interview scheduled with Google next month. Any tips you can share?', FALSE),
(3, 5, 'Event Invitation', 'Hi Rahul, Are you attending the Alumni Meet on March 15? We should catch up!', TRUE);

-- =============================================
-- Useful Queries for Testing
-- =============================================

-- 1. Get all verified alumni by branch
-- SELECT branch, COUNT(*) as count FROM alumni WHERE verified = TRUE GROUP BY branch;

-- 2. Get active job postings with poster details
-- SELECT j.job_id, j.title, j.company, j.location, a.name as posted_by_name 
-- FROM job_posting j JOIN alumni a ON j.posted_by = a.alumni_id 
-- WHERE j.status = 'active';

-- 3. Get upcoming events with participation count
-- SELECT e.event_id, e.name, e.event_date, COUNT(ep.alumni_id) as participants
-- FROM event e LEFT JOIN event_participation ep ON e.event_id = ep.event_id
-- WHERE e.event_date >= CURDATE() GROUP BY e.event_id;

-- 4. Get mentorship statistics
-- SELECT status, COUNT(*) as count FROM mentorship GROUP BY status;

-- 5. Get unread messages for an alumni
-- SELECT m.message_id, m.subject, a.name as sender_name, m.sent_at
-- FROM message m JOIN alumni a ON m.sender_id = a.alumni_id
-- WHERE m.receiver_id = 1 AND m.read_status = FALSE;

-- =============================================
-- End of Schema
-- =============================================
