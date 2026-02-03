-- =============================================
-- Add Alumni from All RVCE Branches
-- Password for all: alumni123
-- =============================================

USE alumnirvce;

-- Password hash for 'alumni123'
-- $2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.

INSERT IGNORE INTO alumni (name, email, password_hash, branch, graduation_year, company, field, verified) VALUES
-- Computer Science & Engineering (CSE)
('Aditya Sharma', 'aditya.sharma@google.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'CSE', 2019, 'Google', 'Software Engineering', TRUE),
('Kavya Nair', 'kavya.nair@microsoft.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'CSE', 2020, 'Microsoft', 'Cloud Computing', TRUE),

-- Information Science & Engineering (ISE)
('Rohan Gupta', 'rohan.gupta@amazon.in', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'ISE', 2018, 'Amazon', 'Data Science', TRUE),
('Ananya Iyer', 'ananya.iyer@oracle.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'ISE', 2021, 'Oracle', 'Database Systems', TRUE),

-- Electronics & Communication Engineering (ECE)
('Siddharth Reddy', 'siddharth.reddy@qualcomm.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'ECE', 2017, 'Qualcomm', 'Wireless Communications', TRUE),
('Meera Krishnan', 'meera.krishnan@intel.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'ECE', 2019, 'Intel', 'Semiconductor Design', TRUE),

-- Mechanical Engineering
('Karthik Rao', 'karthik.rao@tata.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Mechanical', 2018, 'Tata Motors', 'Automotive Engineering', TRUE),
('Pooja Hegde', 'pooja.hegde@bosch.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Mechanical', 2020, 'Bosch', 'Manufacturing Systems', TRUE),

-- Electrical & Electronics Engineering (EEE)
('Vishal Kumar', 'vishal.kumar@siemens.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'EEE', 2019, 'Siemens', 'Power Systems', TRUE),
('Divya Menon', 'divya.menon@abb.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'EEE', 2021, 'ABB', 'Electrical Drives', TRUE),

-- Artificial Intelligence & Machine Learning (AI/ML)
('Aarav Joshi', 'aarav.joshi@openai.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'AI/ML', 2022, 'OpenAI', 'Deep Learning', TRUE),
('Riya Kapoor', 'riya.kapoor@anthropic.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'AI/ML', 2023, 'Anthropic', 'Natural Language Processing', TRUE),

-- Aerospace Engineering
('Akash Verma', 'akash.verma@isro.gov.in', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Aerospace', 2017, 'ISRO', 'Satellite Technology', TRUE),
('Naina Bhat', 'naina.bhat@boeing.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Aerospace', 2019, 'Boeing', 'Aerodynamics', TRUE),

-- Civil Engineering
('Rahul Desai', 'rahul.desai@larsentoubro.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Civil', 2018, 'Larsen & Toubro', 'Structural Engineering', TRUE),
('Shreya Pillai', 'shreya.pillai@dlf.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Civil', 2020, 'DLF', 'Construction Management', TRUE),

-- Chemical Engineering
('Varun Shetty', 'varun.shetty@reliance.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Chemical', 2019, 'Reliance Industries', 'Petrochemical Engineering', TRUE),
('Ishita Malhotra', 'ishita.malhotra@basf.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Chemical', 2021, 'BASF', 'Process Engineering', TRUE),

-- Biotechnology
('Arnav Chatterjee', 'arnav.chatterjee@biocon.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Biotechnology', 2020, 'Biocon', 'Biopharmaceuticals', TRUE),
('Tanvi Agarwal', 'tanvi.agarwal@novozymes.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'Biotechnology', 2022, 'Novozymes', 'Enzyme Technology', TRUE),

-- Industrial Engineering & Management (IEM)
('Arjun Khanna', 'arjun.khanna@deloitte.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'IEM', 2019, 'Deloitte', 'Operations Management', TRUE),
('Sakshi Rao', 'sakshi.rao@accenture.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'IEM', 2021, 'Accenture', 'Supply Chain Management', TRUE),

-- Electronics & Telecommunication (ET)
('Nikhil Pandey', 'nikhil.pandey@ericsson.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'ET', 2018, 'Ericsson', 'Telecom Networks', TRUE),
('Aditi Bhatt', 'aditi.bhatt@nokia.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'ET', 2020, 'Nokia', '5G Technology', TRUE),

-- Electronics & Instrumentation (EIE)
('Harsh Jain', 'harsh.jain@honeywell.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'EIE', 2019, 'Honeywell', 'Process Control', TRUE),
('Ritu Singh', 'ritu.singh@emerson.com', '$2b$10$u0scvuBTJ1MC52nKjw.SEezchdeHOtnSRs0AvDdgQLHmeA.EkiMz.', 'EIE', 2021, 'Emerson', 'Industrial Automation', TRUE);

-- Add contact info for new alumni
INSERT IGNORE INTO alumni_contact (alumni_id, phone, linkedin_url, github_url) 
SELECT alumni_id, '+919876500000', CONCAT('https://linkedin.com/in/', LOWER(REPLACE(name, ' ', ''))), CONCAT('https://github.com/', LOWER(REPLACE(name, ' ', '')))
FROM alumni 
WHERE alumni_id > 5;

-- Add location info for new alumni (all in Bengaluru)
INSERT IGNORE INTO alumni_location (alumni_id, city, state, country)
SELECT alumni_id, 'Bengaluru', 'Karnataka', 'India'
FROM alumni
WHERE alumni_id > 5;

SELECT CONCAT('✓ Added ', COUNT(*), ' new alumni from all branches') as Status
FROM alumni
WHERE alumni_id > 5;
