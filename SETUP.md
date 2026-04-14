# 🚀 SignSpeak AI - COMPLETE SETUP GUIDE

## Step 1: MongoDB Setup

### Option A: Local MongoDB
```bash
# Windows-da
# 1. Download qiling: https://www.mongodb.com/try/download/community
# 2. Install qiling
# 3. Terminal-da:
mongod
```

### Option B: MongoDB Atlas (Recommended)
```
1. https://www.mongodb.com/cloud/atlas ga kiring
2. Create Free Cluster
3. Cluster-dan connection string oling (mo'tini shunaqa):
   mongodb+srv://username:password@cluster.mongodb.net/signspeakAI
4. .env faytga qoying
```

## Step 2: Install Node Modules

```bash
# Root directory-da
npm install

# Client directory-da
cd client
npm install

# Root-ga qaytib turing
cd ..
```

## Step 3: Run Backend

### Terminal 1 - Backend Server
```bash
# TechHappiness/SignSpeak-AI directory-da
npm run dev:server
```

**Success output:**
```
✅ MongoDB ulandi
🚀 Server ishga tushdi: http://localhost:5000
```

## Step 4: Run Frontend

### Terminal 2 - Frontend Server
```bash
# TechHappiness/SignSpeak-AI directory-da
npm run dev:client
```

**Success output:**
```
> signspeakAI-client@1.0.0 dev
> cd client && npm run dev

VITE v5.0.8  ready in xxx ms

➜  Local:   http://localhost:3000/
```

## Step 5: Test Application

### Browser-da
Open: http://localhost:3000

### Register
```
Name: Alex
Email: alex@test.com
Password: 12345678
```

### Open Another Browser Window
```
Register another user:
Name: Sam
Email: sam@test.com  
Password: 12345678
```

### Start Chatting!
1. First tab-da (Alex) -> Sam tanlang
2. Message yozing
3. Second tab-da (Sam) real-time notification ko'rasiz ✅

## 🔥 Features to Test

✅ Register/Login  
✅ Real-time messaging  
✅ Online/Offline status  
✅ Toast notifications  
✅ Typing indicators  
✅ Search users  

## ⚙️ Troubleshooting

### "Cannot connect to MongoDB"
```
1. MongoDB ishga tushdi-mi?
   - Local: mongod process-ni tekshiring
   - Atlas: MONGO_URI to'g'ri-mi?
   
2. .env fayť:
   MONGO_URI=mongodb://localhost:27017/signspeakAI
   (local uchun)
```

### "Port 5000 already in use"
```bash
# Port tekshiring
lsof -i :5000

# Process stop qiling
kill -9 <PID>
```

### "CORS Error"
```
X-Origin request blocked
Solution: Ensure server.js CORS settings correct
```

### Frontend doesn't connect to backend
```
Check vite.config.js proxy settings:
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

## 📦 Production Deployment

### Build Frontend
```bash
cd client
npm run build
```

Output: `client/dist/` folder

### Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

### Deploy Backend to Google Cloud Run
```bash
# Create Dockerfile
gcloud run deploy signspeakAI --source .
```

## 📝 Environment Variables

Create `.env` file in root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/signspeakAI

# Authentication
JWT_SECRET=your_super_secret_jwt_key_12345
```

## 🔐 Security Notes

⚠️ Production-da:
- JWT_SECRET o'zgartiring
- MONGO_URI ra'y bilan belgilang
- CORS whitelist qo'ying
- Rate limiting qo'shish
- Input validation

## 📞 Support

Problem bo'lsa:
1. Browser console-ni ochish (F12)
2. Network tab-da requests ni tekshiring
3. Backend logs-ni ko'ring (Terminal-da)
4. MongoDB connection string-ni tekshiring

---

**Muvaffaqiyat! Happy coding! 🚀**
