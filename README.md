# RVCE Alumni Portal 🎓

A comprehensive full-stack web application for RV College of Engineering alumni management, featuring professional networking, job postings, events, mentorship programs, and secure messaging.

![RVCE](https://img.shields.io/badge/RVCE-Alumni%20Portal-8B0000?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Demo Credentials](#demo-credentials)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

## ✨ Features

### For Alumni
- **Registration & Authentication**: Secure signup with JWT-based authentication
- **Profile Management**: Update personal info, contact details, and location
- **Job Portal**: Post, browse, and apply for job opportunities
- **Events**: RSVP to alumni meets, tech talks, and networking events
- **Mentorship Program**: Search for mentors, send requests, accept/reject mentee requests
- **Messaging System**: Private messaging with fellow alumni
- **Verification System**: Admin verification required for full access

### For Administrators
- **Alumni Verification**: Review and approve new alumni registrations
- **Dashboard Analytics**: View stats on alumni, jobs, events, and activities
- **Event Management**: Create, update, and delete events
- **Reports**: Generate insights with pre-built database queries
- **User Management**: View all alumni, filter by branch/year

### Security Features
- Bcrypt password hashing (10 salt rounds)
- JWT token-based authentication (24-hour expiry)
- HTTP-only cookies for session management
- Input validation and sanitization
- Role-based access control (Admin/Alumni)
- Verification gates for sensitive actions

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), EJS Templates, Bootstrap 5 |
| **Backend** | Node.js (v18+), Express.js |
| **Database** | MySQL (8.0+) |
| **Authentication** | JWT, Bcrypt |
| **Styling** | Custom CSS (RVCE Maroon & Gold theme), Font Awesome, Google Fonts |

## 📁 Project Structure

```
alumni_DBMS/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js              # JWT & role-based auth middleware
│   ├── routes/
│   │   ├── auth.js              # Registration, login, logout
│   │   ├── alumni.js            # Alumni profile & search
│   │   ├── admin.js             # Admin dashboard & management
│   │   ├── jobs.js              # Job CRUD operations
│   │   ├── events.js            # Event CRUD & RSVP
│   │   ├── mentorship.js        # Mentorship requests & responses
│   │   ├── messages.js          # Private messaging
│   │   └── views.js             # EJS view routing
│   ├── server.js                # Main Express application
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css        # RVCE-themed custom styles
│   │   └── js/
│   │       ├── main.js          # Global utilities
│   │       ├── dashboard.js     # Dashboard logic
│   │       ├── jobs.js
│   │       ├── events.js
│   │       ├── mentorship.js
│   │       ├── messages.js
│   │       ├── profile.js
│   │       └── admin.js
│   └── views/
│       ├── layout.ejs           # Base template
│       ├── index.ejs            # Home page
│       ├── login.ejs
│       ├── register.ejs
│       ├── dashboard.ejs        # Role-based dashboard
│       ├── jobs.ejs
│       ├── events.ejs
│       ├── mentorship.ejs
│       ├── messages.ejs
│       ├── profile.ejs
│       └── admin.ejs
├── db/
│   └── schema.sql               # Complete DB schema + sample data
└── README.md

```

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher): [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher): [Download](https://dev.mysql.com/downloads/)
- **npm** (comes with Node.js)

### Step 1: Clone Repository

```bash
cd ~/alumni_DBMS
```

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

## 🗄️ Database Setup

### Step 1: Start MySQL

```bash
# macOS (if using Homebrew)
brew services start mysql

# Or start manually
mysql.server start
```

### Step 2: Create Database and Import Schema

```bash
# Login to MySQL
mysql -u root -p

# Inside MySQL shell, exit and run:
exit

# Import schema (from project root)
mysql -u root -p < db/schema.sql
```

This creates:
- Database: `alumnirvce`
- 10 tables (alumni, admin, job_posting, event, event_participation, mentorship, message, etc.)
- Sample data: 2 admins, 5 verified RVCE alumni, jobs, events, mentorships, messages

### Verify Database Setup

```bash
mysql -u root -p alumnirvce

# Inside MySQL
SHOW TABLES;
SELECT * FROM alumni;
SELECT * FROM admin;
exit
```

## ⚙️ Configuration

### Step 1: Create Environment File

```bash
cd backend
cp .env.example .env
```

### Step 2: Edit `.env` File

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=alumnirvce
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Important**: Replace `your_mysql_password_here` with your actual MySQL root password.

## ▶️ Running the Application

### Development Mode (with auto-restart)

```bash
cd backend
npm run dev
```

### Production Mode

```bash
cd backend
npm start
```

### Expected Output

```
╔═══════════════════════════════════════════╗
║   RVCE Alumni Portal Server Running       ║
║   Port: 3000                              ║
║   Environment: development                ║
╚═══════════════════════════════════════════╝
✓ Database connected successfully
```

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

## 🔑 Demo Credentials

### Alumni Account
- **Email**: `arjun.reddy@nvidia.com`
- **Password**: `alumni123`
- **Role**: Alumni (Verified)

### Admin Account
- **Email**: `admin@rvce.edu.in`
- **Password**: `admin123`
- **Role**: Admin

### Other Alumni Accounts
| Name | Email | Password | Branch |
|------|-------|----------|--------|
| Priya Menon | priya.menon@google.com | alumni123 | CSE |
| Vikram Singh | vikram.singh@amazon.in | alumni123 | ECE |
| Sneha Patel | sneha.patel@microsoft.com | alumni123 | ISE |
| Rahul Iyer | rahul.iyer@flipkart.com | alumni123 | CSE |

## 📚 API Documentation

### Authentication Routes

#### Register Alumni
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "branch": "CSE",
  "graduation_year": 2020,
  "company": "TechCorp",
  "field": "Software Engineering"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "alumni"
}
```

#### Logout
```http
POST /api/auth/logout
```

### Alumni Routes (Require Authentication)

#### Get Profile
```http
GET /api/alumni/profile/:id
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/alumni/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "company": "NewCorp",
  "field": "Data Science",
  "phone": "+919876543210",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "city": "Bengaluru",
  "country": "India"
}
```

#### Search Alumni
```http
GET /api/alumni/search?branch=CSE&field=Software%20Engineering
Authorization: Bearer <token>
```

### Job Routes

#### Get All Jobs
```http
GET /api/jobs?company=Google&location=Bengaluru&status=active
Authorization: Bearer <token>
```

#### Post Job (Verified Alumni Only)
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "company": "TechCorp",
  "location": "Bengaluru",
  "description": "Job description here...",
  "required_branch": "CSE,ISE",
  "required_field": "Software Engineering"
}
```

#### Update Job
```http
PUT /api/jobs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "closed"
}
```

### Event Routes

#### Get All Events
```http
GET /api/events
Authorization: Bearer <token>
```

#### Register for Event
```http
POST /api/events/:id/register
Authorization: Bearer <token>
```

### Mentorship Routes

#### Search Mentors
```http
GET /api/mentorship/mentors?branch=CSE&field=AI
Authorization: Bearer <token>
```

#### Request Mentorship
```http
POST /api/mentorship/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "mentor_id": 2
}
```

#### Respond to Mentorship Request
```http
PUT /api/mentorship/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

### Admin Routes (Admin Only)

#### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

#### Verify Alumni
```http
PUT /api/admin/alumni/:id/verify
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "verified": true
}
```

#### Create Event
```http
POST /api/admin/events
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Tech Talk 2026",
  "description": "Discussion on emerging technologies",
  "event_date": "2026-06-15",
  "location": "RVCE Auditorium"
}
```

## 🎨 UI/UX Design

### Color Palette (Inspired by rvce.edu.in)
- **Primary (Maroon)**: `#8B0000`
- **Accent (Gold)**: `#D4A017`
- **Text Dark**: `#212529`
- **Background**: `#F8F9FA`

### Typography
- **Headers**: Roboto Bold (700)
- **Body**: Open Sans Regular (400)
- **Buttons**: Roboto Medium (500)

### Key Features
- Responsive design (mobile-first approach)
- Bootstrap 5 grid system
- Card-based layouts for content
- Smooth transitions and hover effects
- Fixed navigation bar
- Professional footer with RVCE branding

## 🚢 Deployment

### Deploy to Render (Backend)

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect GitHub repository
4. Set environment variables in Render dashboard
5. Build command: `cd backend && npm install`
6. Start command: `node server.js`

### Deploy Database to Railway

1. Sign up at [Railway](https://railway.app)
2. Create new MySQL database
3. Import schema using Railway CLI or dashboard
4. Update `.env` with Railway database credentials

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=<railway_host>
DB_USER=<railway_user>
DB_PASSWORD=<railway_password>
DB_NAME=alumnirvce
JWT_SECRET=<strong_production_secret>
PORT=3000
```

## 📸 Screenshots

### Home Page
Clean hero section with RVCE branding, feature cards, and statistics.

### Alumni Dashboard
Role-based dashboard showing:
- Statistics (Alumni count, active jobs, events, messages)
- Recent job postings
- Upcoming events
- Quick action buttons

### Admin Dashboard
- Pending verifications table
- Alumni analytics by branch and year
- Event management
- Database query reports

### Job Portal
- Filterable job listings
- Post job modal
- Job cards with company, location, and requirements

### Mentorship
- Search mentors by branch/field
- Send mentorship requests
- Accept/reject requests
- View request status

## 🧪 Testing Queries

Run these queries in MySQL to test functionality:

```sql
-- Get verified alumni by branch
SELECT branch, COUNT(*) as count 
FROM alumni 
WHERE verified = TRUE 
GROUP BY branch;

-- Get active jobs with poster details
SELECT j.job_id, j.title, j.company, a.name as posted_by
FROM job_posting j 
JOIN alumni a ON j.posted_by = a.alumni_id 
WHERE j.status = 'active';

-- Get upcoming events with participants
SELECT e.event_id, e.name, e.event_date, COUNT(ep.alumni_id) as participants
FROM event e 
LEFT JOIN event_participation ep ON e.event_id = ep.event_id
WHERE e.event_date >= CURDATE() 
GROUP BY e.event_id;

-- Mentorship statistics
SELECT status, COUNT(*) as count 
FROM mentorship 
GROUP BY status;

-- Unread messages for alumni
SELECT COUNT(*) as unread_count
FROM message 
WHERE receiver_id = 1 AND read_status = FALSE;
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution**: Check MySQL credentials in `.env` file.

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::3000
```
**Solution**: Change port in `.env` or kill process:
```bash
lsof -ti:3000 | xargs kill -9
```

### JWT Token Invalid
**Solution**: Clear browser cookies and login again.

### Alumni Not Verified
**Solution**: Login as admin and verify the alumni account from Admin Panel.

## 📝 License

This project is created for educational purposes as part of DBMS coursework at RV College of Engineering.

## 👥 Contributors

- RVCE CSE/ISE Students (2023-2024 Batch)
- Project Supervisor: [Faculty Name]

## 📧 Support

For issues or queries:
- Email: admin@rvce.edu.in
- GitHub Issues: [Create Issue]

---

**Made with ❤️ for RVCE Alumni Community**

© 2026 RV College of Engineering | Bengaluru, Karnataka, India
