#!/bin/bash

# SignSpeak AI - Complete Setup & Start Script
# Windows CMD yoki Terminal orqali ishga tushiring

echo "🚀 SignSpeak AI - Complete Setup Script"
echo "========================================"

# Check Node.js
echo "✓ Checking Node.js..."
node --version || { echo "❌ Node.js not installed"; exit 1; }

# Check MongoDB
echo "✓ Checking MongoDB..."
mongod --version || { echo "⚠️  MongoDB not installed (required for local development)"; }

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
echo ""
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Seed database
echo ""
echo "🌱 Seeding database..."
npm run seed

# Success
echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  npm run dev:server"
echo ""
echo "Terminal 2 (Frontend):"
echo "  npm run dev:client"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Test credentials:"
echo "  Email: ali@example.com"
echo "  Password: 123456"
echo ""
