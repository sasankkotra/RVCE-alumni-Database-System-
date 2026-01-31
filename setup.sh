#!/bin/bash

# RVCE Alumni Portal - Setup Script
# This script automates the initial setup process

echo "╔═══════════════════════════════════════════╗"
echo "║   RVCE Alumni Portal - Setup Wizard      ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0 or higher."
    echo "   macOS: brew install mysql"
    exit 1
fi

echo "✓ MySQL found"
echo ""

# Step 1: Install dependencies
echo "📦 Installing Node.js dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Step 2: Setup environment file
echo "⚙️  Setting up environment file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created .env file"
    echo "⚠️  IMPORTANT: Edit backend/.env and set your MySQL password!"
    echo "   DB_PASSWORD=your_mysql_password"
else
    echo "ℹ️  .env file already exists"
fi
echo ""

# Step 3: Database setup
echo "🗄️  Database Setup"
echo "-------------------"
read -p "Enter MySQL root password: " -s MYSQL_PASSWORD
echo ""

# Test MySQL connection
mysql -u root -p"$MYSQL_PASSWORD" -e "SELECT 1;" &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to MySQL. Check your password."
    exit 1
fi

echo "✓ MySQL connection successful"

# Import schema
echo "Importing database schema..."
cd ..
mysql -u root -p"$MYSQL_PASSWORD" < db/schema.sql
if [ $? -ne 0 ]; then
    echo "❌ Failed to import schema"
    exit 1
fi

echo "✓ Database schema imported successfully"
echo ""

# Verify data
echo "Verifying sample data..."
ALUMNI_COUNT=$(mysql -u root -p"$MYSQL_PASSWORD" alumnirvce -se "SELECT COUNT(*) FROM alumni;")
echo "✓ Alumni in database: $ALUMNI_COUNT"
echo ""

# Final instructions
echo "╔═══════════════════════════════════════════╗"
echo "║           Setup Complete! 🎉              ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and set DB_PASSWORD"
echo "2. cd backend && npm start"
echo "3. Open http://localhost:3000"
echo ""
echo "Test Credentials:"
echo "  Alumni: arjun.reddy@nvidia.com / alumni123"
echo "  Admin:  admin@rvce.edu.in / admin123"
echo ""
echo "Need help? Read README.md or QUICKSTART.md"
echo ""
