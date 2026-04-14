# 🤟 SignSpeak AI — Telegram-like Chat

Real foydalanuvchilar o'rtasida real-time chat ilovasi.

## 🚀 Ishga tushirish

```bash
# 1. Kerakli paketlarni o'rnatish
npm install
cd client && npm install && cd ..

# 2. Server ishga tushirish
npm run dev:server

# 3. Client ishga tushirish (yangi terminal)
npm run dev:client

# 4. Brauzerda ochish
# http://localhost:5173
```

## 🌟 Yangi imkoniyatlar

### 👤 Real foydalanuvchilar
- Ro'yxatdan o'tishda **@username** tanlash
- Foydalanuvchini **@username**, **ism** yoki **ID** orqali qidirish
- Har bir foydalanuvchining **unikal ID** raqami bor

### 💬 Chat
- Real-time xabar almashish (Socket.io)
- **Yozmoqda...** indikatori
- Xabar o'qildi belgisi (**✓✓**)
- Xabarlar sanasi bo'yicha guruhlash
- O'qilmagan xabarlar soni ko'rsatgich

### 👥 Guruhlar
- Guruh yaratishda avatar va tavsif qo'shish
- Guruh a'zolarini ko'rish
- Guruh chatida real-time xabarlar
- Guruhdan chiqish imkoniyati

### 👤 Profil
- Avatar tanlash (emoji)
- Ism, @username, bio o'zgartirish
- **ID raqamini ko'rish** (boshqalar sizni topishi uchun)

## 📁 Fayl tuzilishi

```
SignSpeak-AI/
├── server.js          # Express + Socket.io + SQLite backend
├── seed.js            # Test foydalanuvchilar
├── database.db        # SQLite bazasi (avtomatik yaratiladi)
├── package.json
└── client/
    └── src/
        └── App.jsx    # React frontend
```

## 🔌 API Endpoints

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | /api/register | Ro'yxat |
| POST | /api/login | Kirish |
| GET | /api/users | Barcha foydalanuvchilar |
| GET | /api/users/search?q= | Qidirish |
| GET | /api/users/me | Mening profilim |
| PUT | /api/users/:id | Profilni yangilash |
| GET | /api/messages/:userId | Direct xabarlar |
| POST | /api/groups | Guruh yaratish |
| GET | /api/groups | Guruhlarim |
| GET | /api/groups/:id/messages | Guruh xabarlari |

## 🧪 Test foydalanuvchilar

```bash
node seed.js
```
Yaratilgan foydalanuvchilar: ali@test.com, malika@test.com, jasur@test.com
Parol: **123456**
# TechHappiness
