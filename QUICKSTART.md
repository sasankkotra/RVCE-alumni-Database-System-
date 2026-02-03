# RVCE Alumni Portal - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Git

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd alumni_DBMS
```

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

### Step 3: Setup MySQL Database

Run this command to set up the database:

```bash
# From the project root directory
mysql -u root -p < db/schema.sql

# Enter your MySQL root password when prompted
```

This will:
- Create the `alumnirvce` database (if it doesn't exist)
- Set up all tables
- Add sample data (5 alumni, 2 admins, 5 events, 5 jobs)

**✅ Safe to run anytime!** It won't delete your registered alumni.

### Step 4: Configure Environment
```bash
# Make sure you're in the backend directory
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file and set your MySQL credentials
# Important: Change DB_PASSWORD to your MySQL root password
```

Your `.env` should look like:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=alumnirvce
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development
```

### Step 5: Start the Server
```bash
# From the backend directory
node server.js

# OR use npm start
npm start
```

You should see:
```
╔═══════════════════════════════════════════╗
║   RVCE Alumni Portal Server Running       ║
║   Port: 3000                              ║
║   Environment: development                ║
╚═══════════════════════════════════════════╝

✓ Database connected successfully
```

### Step 6: Access Application
Open your browser and go to: **http://localhost:3000**

## 🔑 Test Credentials

### Alumni Login
- Email: `arjun.reddy@nvidia.com`
- Password: `alumni123`

### Admin Login
- Email: `admin@rvce.edu.in`
- Password: `admin123`

## 📋 Verify Installation

1. ✅ Homepage loads with RVCE branding
2. ✅ Login with test credentials works
3. ✅ Dashboard shows stats and content
4. ✅ Navigate to Jobs, Events, Mentorship
5. ✅ Admin can verify alumni accounts

## 🐛 Common Issues

**Database Connection Failed**
- Check MySQL is running: `mysql.server status`
- Verify password in `.env` file

**Port 3000 Already in Use**
- Kill process: `lsof -ti:3000 | xargs kill -9`
- Or change PORT in `.env`

**Account Not Verified**
- Login as admin
- Go to Admin Panel → Verifications
- Click "Verify" button

## 📚 Next Steps

1. Read full [README.md](README.md) for API docs
2. Test all features (Jobs, Events, Mentorship, Messages)
3. Customize branding (CSS in `frontend/public/css/style.css`)
4. Add more sample data via MySQL

## 🎓 Project Structure

```
backend/          → Server & API routes
frontend/         → Views (EJS) & static files
db/              → Database schema
```

## 💡 Pro Tips

- Use `npm run dev` for auto-restart during development
- Check browser console for JavaScript errors
- Test API endpoints with Postman/Thunder Client
- Run SQL queries to verify data changes

---

**Need Help?** Check README.md or contact your project supervisor.
