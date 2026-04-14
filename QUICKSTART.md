# 🚀 QUICKSTART - 5 MINUTES

## ⚡ SUPER TEZKOR BOSHLASH

### Terminal 1: Server Ishga Tushirish
```bash
cd c:/Users/elzodbek/OneDrive/Desktop/TechHappiness/SignSpeak-AI
mongod
# (yangi terminal'da)
npm run seed
npm run dev:server
```

### Terminal 2: Frontend Ishga Tushirish
```bash
cd c:/Users/elzodbek/OneDrive/Desktop/TechHappiness/SignSpeak-AI
npm run dev:client
```

### Browser'da
```
http://localhost:5173
```

## 🧪 Test Credentials

```
Email: ali@example.com
Password: 123456
```

**Yoki:**
```
Email: fatima@example.com
Password: 123456
```

## ✅ Tekshiruvi

- [ ] mongod ishga tushdi (Terminal 1)
- [ ] seed data qo'shildi (`npm run seed`)
- [ ] backend ishga tushdi (`npm run dev:server`)
- [ ] frontend ishga tushdi (`npm run dev:client`)
- [ ] browser `http://localhost:5173` ochildi
- [ ] login muvaffaqiyatli boldi
- [ ] xabar yuborish ishladi

## 🔧 MongoDB Tekshiruvi

```bash
# Local MongoDB tekshiruvi
mongod --version

# Agar kerak bo'lsa, mongosh qo'ling
mongosh
use signspeakAI
db.users.find()
```

## 📂 File Structure

```
SignSpeak-AI/
├── server.js          ← Backend
├── seed.js            ← Test data
├── .env.local         ← Config (local)
├── package.json       ← Server dependencies
│
├── client/
│   ├── src/App.jsx    ← Frontend
│   ├── vite.config.js
│   └── package.json
│
├── README.md          ← Full documentation
├── SETUP_GUIDE.md     ← Detailed setup
└── QUICKSTART.md      ← This file
```

## 🆘 Common Issues

**Port 5000 band?**
```bash
PORT=5001 npm run dev:server
```

**MongoDB xatosi?**
```bash
mongod  # ishga tushirish yoki
# .env.local da MONGO_URI tekshirish
```

**"Cannot find module"?**
```bash
npm install
cd client && npm install
```

---

**Bugun tugadi! 🎉**
