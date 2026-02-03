-- =============================================
-- RVCE Alumni Portal - Sample Data ONLY
-- Use this to add sample data without dropping tables
-- =============================================

USE alumnirvce;

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

-- Note: Contact, location, jobs, events, and other data will only be added if alumni exist
-- Using INSERT IGNORE to skip duplicates based on email uniqueness
