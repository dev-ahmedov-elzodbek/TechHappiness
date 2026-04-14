# 📖 SignSpeak AI - Detailed Setup Guide

## 📋 Pre-requisites Tekshiruvi

### 1. Node.js va npm O'rnatish

```bash
# Node.js version tekshiruvi
node --version  # v16+ kerak

# npm version tekshiruvi
npm --version   # v8+ kerak
```

**Windows'da o'rnatish:** https://nodejs.org/en/download/

### 2. MongoDB Tayyorlash

#### Option A: Local MongoDB (Recommended for Development)

**Windows'da o'rnatish:**
1. https://www.mongodb.com/try/download/community ga borib, **Windows** versiyasini yuklab oling
2. Installer ni ishga tushiring va default settings bilan o'rnatish
3. Installation tugatgandan so'ng, MongoDB automatic ravishda ishga tushadi

**Tekshiruvi:**
```bash
mongod --version
```

#### Option B: MongoDB Atlas (Cloud)

1. https://www.mongodb.com/cloud/atlas ga kiring
2. Yangi account yarating (free tier bilan)
3. Yangi "Cluster" yarating
4. "Connection String" ni klip qiling
5. `.env.local` da MONGO_URI ni o'zgartiring:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/signspeakAI
```

## 🚀 Step-by-Step Setup

### Step 1: Repository'ni Tayyorlash

```bash
# ProjectDirectory'ga kiring
cd SignSpeak-AI

# Barcha fayllni tekshiring
ls -la

# `.env.local` fayli borligini tekshiring
cat .env.local
```

### Step 2: Dependencies O'rnatish

```bash
# Server dependencies
npm install

# Client dependencies
cd client && npm install && cd ..
```

**Expected Output:**
```
added 135 packages (server)
added 159 packages (client)
```

### Step 3: MongoDB'ni Tekshiruvi

#### Local MongoDB (Windows):
```bash
# New Terminal oching
mongod

# Expected output:
# > {"t":{"$date":"2026-04-14T18:00:00.000Z"},"msg":"Listening on port 27017"}
```

#### MongoDB Atlas:
- `.env.local` da MONGO_URI correct ekanini tekshiring
- Network Access da `0.0.0.0/0` allowing qilish kerak

### Step 4: Seed Data O'rnatish

```bash
# Terminal'ni SignSpeak-AI directory'da oching va:
npm run seed

# Expected output:
# ✅ MongoDB ulandi
# ✅ 5 ta foydalanuvchi qo'shildi
# ✅ Seed jarayoni tugadi!
```

### Step 5: Server Ishga Tushirish

```bash
# Terminal 1 (yoki Terminal oching)
npm run dev:server

# Expected output:
# ✅ MongoDB ulandi
# 🚀 Server ishga tushdi: http://localhost:5000
```

### Step 6: Client Ishga Tushirish

```bash
# Terminal 2 (yangi Terminal oching)
npm run dev:client

# Expected output:
# VITE v5.x.x ready in xxx ms
# ➜ Local: http://localhost:5173/
```

### Step 7: Brauzer'da Ochish

```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
```

## 🧪 Test Qilish

### Test Login

```
Email: ali@example.com
Password: 123456
```

**UI'da Qilish:**
1. Email input'ga "ali@example.com" yozing
2. Password input'ga "123456" yozing
3. "Kirish" tugmasini bosing
4. Foydalanuvchilar ro'yxati ko'rsatilishi kerak

### Real-time Messaging Test

1. **Ikki user bilan Test:**
   - Browser 1: ali@example.com
   - Browser 2: fatima@example.com

2. **Message yuborish:**
   - Browser 1 da fatimani tanlang
   - Message yozing va "Yuborish" bosing
   - Browser 2 da xabar ko'rinishi kerak

3. **Typing indicator:**
   - Message input'ni boshlang
   - Boshqa browser'da "✍️ Yozmoqda..." ko'rinishi kerak

## 🛠️ Debugging

### Problem: "EADDRINUSE" error (Port alreadyin use)

```bash
# Port 5000 o'zga process'da bilan ko'rish
netstat -ano | findstr :5000

# Process'ni to'xtatish (Windows CMD)
taskkill /PID <PID> /F

# Yoki boshqa port bilan ishga tushirish
PORT=5001 npm run dev:server
```

### Problem: "MongoDB connection error"

```bash
# Tekshiruv 1: MongoDB ishga tushganmi?
mongod

# Tekshiruv 2: .env.local ma'lumotlari to'g'rimi?
cat .env.local

# Tekshiruv 3: MongoDB atlas'da credentials to'g'rimi?
# Atlas -> Network Access -> IP Whitelist -> 0.0.0.0/0 allow qiling

# Tekshiruv 4: Firewall blokxlamayapti-mi?
# Windows Defender Firewall da MongoDB o'tkazish
```

### Problem: "Cannot find module" error

```bash
# node_modules'ni o'chirish va qayta o'rnatish
rm -r node_modules package-lock.json
npm install

cd client
rm -r node_modules package-lock.json
npm install
cd ..
```

### Problem: "CORS error" yoki "WebSocket error"

**Backend logs'da qidirish:**
```bash
# Terminal 1 da Backend logs'ni tekshiring
# "WebSocket connection error" ko'rinishining-mi?

# Frontend URL'si to'g'rimi?
# Development: http://localhost:5173
# Production: https://yourdomain.com
```

**Tekshiruv:**
1. DevTools -> Console tab
2. WebSocket connection error'ni qidiring
3. Backend logs'da socket connection'ni tekshiring

## 📊 Database Tekshiruvi

### MongoDB Compass (GUI)

1. MongoDB Compass'ni yuklab oling: https://www.mongodb.com/products/compass
2. "localhost:27017" ga ulaning
3. "signspeakAI" database'ni tanlang
4. Collections ni ko'rish:
   - `users` - Barcha foydalanuvchilar
   - `messages` - Barcha xabarlar
   - `groups` - Barcha guruhlar

### MongoDB CLI

```bash
# MongoDB shell'ga kirish
mongosh

# Database'ni tanlash
use signspeakAI

# Foydalanuvchilarni ko'rish
db.users.find().pretty()

# Xabarlarni ko'rish
db.messages.find().pretty()

# Exit
exit
```

## 📝 Production Deployment

### Backend - Render.com

1. GitHub'ga push qiling
2. https://render.com ga kiring
3. "New Web Service" yarating
4. GitHub repository'ni tanlang
5. Environment variables o'rnatish:
   ```
   PORT=10000
   MONGO_URI=<your-atlas-uri>
   JWT_SECRET=<your-secret>
   NODE_ENV=production
   ```

### Frontend - Vercel

1. Frontend build qiling:
   ```bash
   cd client && npm run build
   ```

2. https://vercel.com ga kiring
3. GitHub repository'ni import qiling
4. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Environment variables:
   ```
   VITE_API_URL=<your-backend-url>
   ```

## ✅ Checklist

- [ ] Node.js v16+ o'rnatilgan
- [ ] MongoDB tayyorlangan
- [ ] `npm install` server
- [ ] `npm install` client'da
- [ ] `.env.local` configured
- [ ] `npm run seed` tugadi
- [ ] Backend `npm run dev:server`da ishga tushdi
- [ ] Frontend `npm run dev:client`da ishga tushdi
- [ ] Browser'da http://localhost:5173 ochildi
- [ ] Test login muvaffaqiyatli
- [ ] Real-time messaging ishlaydi

## 🆘 More Help

- GitHub Issues: https://github.com/yourusername/SignSpeak-AI/issues
- MongoDB Docs: https://docs.mongodb.com/
- Socket.io Docs: https://socket.io/docs/
- React Docs: https://react.dev/
- Vite Docs: https://vitejs.dev/

---

**Happy Coding! 🚀**
