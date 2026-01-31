# RVCE Alumni Portal - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Exit and import schema
mysql -u root -p < ../db/schema.sql
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and set your MySQL password
# DB_PASSWORD=your_mysql_password_here
```

### Step 4: Start Server
```bash
npm start
```

### Step 5: Access Application
Open browser: **http://localhost:3000**

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
