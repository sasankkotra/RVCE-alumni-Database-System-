# Database Setup Guide

## Files in this directory:

### 1. `schema.sql` (COMPLETE SETUP - USE ONCE)
**⚠️ WARNING: This drops and recreates the entire database!**

Use this **ONLY ONCE** during initial project setup:
```bash
mysql -u root -p < db/schema.sql
```

This file:
- Drops existing `alumnirvce` database
- Creates fresh database and all tables
- Adds sample data (5 alumni, 2 admins, events, jobs)

**Never run this again** unless you want to reset everything!

### 2. `init_schema.sql` (SAFE VERSION - Tables only)
Creates database and tables **without dropping** existing data.

Use this if you want to:
- Add tables to existing database
- Restore table structure without losing data

```bash
mysql -u root -p < db/init_schema.sql
```

### 3. `sample_data.sql` (Add sample data only)
Adds only the 5 sample alumni and 2 admin accounts.

Uses `INSERT IGNORE` so it won't duplicate existing records.

```bash
mysql -u root -p < db/sample_data.sql
```

## Common Scenarios:

### First time setup:
```bash
mysql -u root -p < db/schema.sql
```

### After accidentally running schema.sql again:
Your data is gone. Start fresh and register alumni through the website.

### Add more sample data later:
```bash
mysql -u root -p < db/sample_data.sql
```

### Server stopped/restarted:
No need to run any SQL! Your data persists. Just start the server:
```bash
cd backend
node server.js
```

## Important Notes:

1. **Data Persistence**: Once you register alumni through the website, they stay in the database permanently (until you re-run `schema.sql`)

2. **Server Restarts**: Starting/stopping `node server.js` does NOT affect the database

3. **Sample Data**: The 5 default alumni are in the schema only for demo purposes. Your registered alumni are separate.

## Test Credentials:

**Alumni:** arjun.reddy@nvidia.com / alumni123  
**Admin:** admin@rvce.edu.in / admin123
