import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import initSqlJs from "sql.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
  transports: ["websocket", "polling"],
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "signspeakai_secret_key_2024";
const DB_PATH = path.join(__dirname, "database.db");

let db;
let SQL;

async function initDatabase() {
  SQL = await initSqlJs();
  let buffer;
  if (fs.existsSync(DB_PATH)) {
    buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT '👤',
      bio TEXT DEFAULT '',
      online INTEGER DEFAULT 0,
      lastSeen TEXT DEFAULT CURRENT_TIMESTAMP,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER,
      groupId INTEGER,
      text TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(senderId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT DEFAULT '👥',
      description TEXT DEFAULT '',
      admin INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groupId INTEGER NOT NULL,
      userId INTEGER NOT NULL
    );
  `);

  try {
    db.run("ALTER TABLE users ADD COLUMN username TEXT");
    const usrs = allSQL("SELECT id, email FROM users WHERE username IS NULL OR username = ''");
    for (const u of usrs) {
      const uname = u.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() + u.id;
      db.run("UPDATE users SET username = ? WHERE id = ?", [uname, u.id]);
    }
  } catch (e) {}

  saveDatabase();
  console.log("✅ DATABASE READY");
}

function saveDatabase() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function runSQL(q, p = []) {
  try { db.run(q, p); saveDatabase(); return { success: true }; }
  catch (e) { console.error("SQL:", e.message); return { success: false, error: e.message }; }
}

function getSQL(q, p = []) {
  try {
    const s = db.prepare(q); s.bind(p);
    const r = s.step() ? s.getAsObject() : null; s.free(); return r;
  } catch (e) { return null; }
}

function allSQL(q, p = []) {
  try {
    const s = db.prepare(q); s.bind(p);
    const r = []; while (s.step()) r.push(s.getAsObject()); s.free(); return r;
  } catch (e) { return []; }
}

const hashPw = (pw) => bcryptjs.hashSync(pw, 10);
const checkPw = (pw, h) => bcryptjs.compareSync(pw, h);
const makeToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token yo'q" });
  try { const { id } = jwt.verify(token, JWT_SECRET); req.userId = id; next(); }
  catch { res.status(401).json({ error: "Token noto'g'ri" }); }
};

function safeUser(str) {
  return str.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 32);
}

function getFullGroup(groupId) {
  const g = getSQL("SELECT * FROM groups WHERE id = ?", [groupId]);
  if (!g) return null;
  const members = allSQL(
    "SELECT u.id, u.name, u.username, u.avatar, u.online FROM users u JOIN group_members gm ON u.id = gm.userId WHERE gm.groupId = ?",
    [groupId]
  );
  const lastMsg = getSQL(
    "SELECT m.text, m.createdAt, u.name AS senderName FROM messages m JOIN users u ON m.senderId = u.id WHERE m.groupId = ? ORDER BY m.createdAt DESC LIMIT 1",
    [groupId]
  );
  return {
    id: g.id, name: g.name, avatar: g.avatar, description: g.description,
    admin: g.admin, members,
    lastMessage: lastMsg?.text || "",
    lastMessageSender: lastMsg?.senderName || "",
    lastMessageTime: lastMsg?.createdAt || "",
    createdAt: g.createdAt,
  };
}

// REGISTER
app.post("/api/register", (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Barcha maydonlar kerak" });

    const uname = username ? safeUser(username) : safeUser(name) + Math.floor(Math.random() * 9999);
    if (uname.length < 3) return res.status(400).json({ error: "Username kamida 3 belgi" });

    if (getSQL("SELECT id FROM users WHERE email = ?", [email]))
      return res.status(400).json({ error: "Bu email band" });
    if (getSQL("SELECT id FROM users WHERE username = ?", [uname]))
      return res.status(400).json({ error: "Bu username band" });

    const avatars = ["👋","🤟","✌️","🖐️","👏","🙌","🎯","🚀","⚡","🔥"];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    runSQL("INSERT INTO users (name, username, email, password, avatar) VALUES (?,?,?,?,?)", [name, uname, email, hashPw(password), avatar]);
    const user = getSQL("SELECT id FROM users WHERE email = ?", [email]);
    res.json({ token: makeToken(user.id), user: { id: user.id, name, username: uname, email, avatar, bio: "" } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// LOGIN
app.post("/api/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const user = getSQL("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !checkPw(password, user.password))
      return res.status(401).json({ error: "Email yoki parol xato" });
    runSQL("UPDATE users SET online = 1 WHERE id = ?", [user.id]);
    res.json({ token: makeToken(user.id), user: { id: user.id, name: user.name, username: user.username || "", email: user.email, avatar: user.avatar, bio: user.bio } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET ALL USERS
app.get("/api/users", auth, (req, res) => {
  try {
    const users = allSQL("SELECT id, name, username, email, avatar, bio, online, lastSeen FROM users WHERE id != ? ORDER BY name", [req.userId]);
    const enriched = users.map((u) => {
      const unread = getSQL("SELECT COUNT(*) as cnt FROM messages WHERE senderId = ? AND receiverId = ? AND read = 0", [u.id, req.userId]);
      const last = getSQL("SELECT text, createdAt FROM messages WHERE (senderId=? AND receiverId=?) OR (senderId=? AND receiverId=?) ORDER BY createdAt DESC LIMIT 1", [u.id, req.userId, req.userId, u.id]);
      return { ...u, unreadCount: unread?.cnt || 0, lastMessage: last?.text || "", lastMessageTime: last?.createdAt || "" };
    });
    enriched.sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      if (a.lastMessageTime) return -1;
      if (b.lastMessageTime) return 1;
      return a.name.localeCompare(b.name);
    });
    res.json(enriched);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SEARCH USERS
app.get("/api/users/search", auth, (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json([]);
    const query = q.trim();
    let users;
    if (/^\d+$/.test(query)) {
      users = allSQL("SELECT id, name, username, email, avatar, bio, online FROM users WHERE id != ? AND id = ?", [req.userId, parseInt(query)]);
    } else {
      const sq = query.startsWith("@") ? query.slice(1) : query;
      users = allSQL("SELECT id, name, username, email, avatar, bio, online FROM users WHERE id != ? AND (name LIKE ? OR username LIKE ? OR email LIKE ?) ORDER BY name LIMIT 20",
        [req.userId, `%${sq}%`, `%${sq}%`, `%${sq}%`]);
    }
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET ME
app.get("/api/users/me", auth, (req, res) => {
  try {
    const user = getSQL("SELECT id, name, username, email, avatar, bio, online FROM users WHERE id = ?", [req.userId]);
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// UPDATE PROFILE
app.put("/api/users/:id", auth, (req, res) => {
  try {
    if (req.userId != req.params.id) return res.status(403).json({ error: "Ruxsat yo'q" });
    const { name, username, bio, avatar } = req.body;
    const clean = username ? safeUser(username) : null;
    if (clean) {
      if (clean.length < 3) return res.status(400).json({ error: "Username kamida 3 belgi" });
      if (getSQL("SELECT id FROM users WHERE username = ? AND id != ?", [clean, req.userId]))
        return res.status(400).json({ error: "Bu username band" });
      runSQL("UPDATE users SET name=?, username=?, bio=?, avatar=? WHERE id=?", [name||"", clean, bio||"", avatar||"👤", req.userId]);
    } else {
      runSQL("UPDATE users SET name=?, bio=?, avatar=? WHERE id=?", [name||"", bio||"", avatar||"👤", req.userId]);
    }
    res.json(getSQL("SELECT id, name, username, email, avatar, bio FROM users WHERE id = ?", [req.userId]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET DIRECT MESSAGES
app.get("/api/messages/:otherId", auth, (req, res) => {
  try {
    const { otherId } = req.params;
    const msgs = allSQL(
      "SELECT m.id, m.senderId, m.text, m.createdAt, m.read, u.name AS sn, u.avatar AS sa, u.username AS su FROM messages m JOIN users u ON m.senderId = u.id WHERE (m.senderId=? AND m.receiverId=?) OR (m.senderId=? AND m.receiverId=?) ORDER BY m.createdAt ASC",
      [req.userId, otherId, otherId, req.userId]
    );
    runSQL("UPDATE messages SET read = 1 WHERE senderId = ? AND receiverId = ? AND read = 0", [otherId, req.userId]);
    res.json(msgs.map(m => ({ _id: m.id, text: m.text, createdAt: m.createdAt, read: m.read, senderId: { _id: m.senderId, name: m.sn, avatar: m.sa, username: m.su } })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CREATE GROUP
app.post("/api/groups", auth, (req, res) => {
  try {
    const { name, description, memberIds, avatar } = req.body;
    if (!name) return res.status(400).json({ error: "Guruh nomi kerak" });
    runSQL("INSERT INTO groups (name, description, avatar, admin) VALUES (?,?,?,?)", [name, description||"", avatar||"👥", req.userId]);
    const g = getSQL("SELECT id FROM groups WHERE admin = ? ORDER BY id DESC LIMIT 1", [req.userId]);
    runSQL("INSERT INTO group_members (groupId, userId) VALUES (?,?)", [g.id, req.userId]);
    for (const mid of (memberIds||[])) {
      if (mid !== req.userId) runSQL("INSERT INTO group_members (groupId, userId) VALUES (?,?)", [g.id, mid]);
    }
    res.json(getFullGroup(g.id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET GROUPS
app.get("/api/groups", auth, (req, res) => {
  try {
    const gs = allSQL("SELECT DISTINCT g.id FROM groups g JOIN group_members gm ON g.id = gm.groupId WHERE gm.userId = ? ORDER BY g.id DESC", [req.userId]);
    res.json(gs.map(g => getFullGroup(g.id)).filter(Boolean));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET GROUP MESSAGES
app.get("/api/groups/:groupId/messages", auth, (req, res) => {
  try {
    const { groupId } = req.params;
    if (!getSQL("SELECT id FROM group_members WHERE groupId=? AND userId=?", [groupId, req.userId]))
      return res.status(403).json({ error: "A'zo emassiz" });
    const msgs = allSQL(
      "SELECT m.id, m.senderId, m.groupId, m.text, m.createdAt, u.name AS sn, u.avatar AS sa, u.username AS su FROM messages m JOIN users u ON m.senderId = u.id WHERE m.groupId = ? ORDER BY m.createdAt ASC",
      [groupId]
    );
    res.json(msgs.map(m => ({ _id: m.id, text: m.text, createdAt: m.createdAt, groupId: m.groupId, senderId: { _id: m.senderId, name: m.sn, avatar: m.sa, username: m.su } })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ADD MEMBER
app.post("/api/groups/:groupId/members", auth, (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const g = getSQL("SELECT * FROM groups WHERE id = ?", [groupId]);
    if (!g) return res.status(404).json({ error: "Topilmadi" });
    if (g.admin !== req.userId) return res.status(403).json({ error: "Faqat admin" });
    if (getSQL("SELECT id FROM group_members WHERE groupId=? AND userId=?", [groupId, userId]))
      return res.status(400).json({ error: "Allaqachon a'zo" });
    runSQL("INSERT INTO group_members (groupId, userId) VALUES (?,?)", [groupId, userId]);
    res.json(getFullGroup(groupId));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// LEAVE GROUP
app.delete("/api/groups/:groupId/leave", auth, (req, res) => {
  try {
    runSQL("DELETE FROM group_members WHERE groupId=? AND userId=?", [req.params.groupId, req.userId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SOCKET.IO
const onlineUsers = new Map();
const userSockets = new Map();

io.on("connection", (socket) => {
  socket.on("user:login", (userId) => {
    onlineUsers.set(String(userId), socket.id);
    userSockets.set(socket.id, String(userId));
    runSQL("UPDATE users SET online = 1 WHERE id = ?", [userId]);
    io.emit("user:status", { userId, online: true });
    const groups = allSQL("SELECT groupId FROM group_members WHERE userId = ?", [userId]);
    groups.forEach(g => socket.join(`group:${g.groupId}`));
  });

  socket.on("message:send", (data) => {
    try {
      const { senderId, receiverId, text } = data;
      if (!text?.trim()) return;
      runSQL("INSERT INTO messages (senderId, receiverId, text) VALUES (?,?,?)", [senderId, receiverId, text.trim()]);
      const sender = getSQL("SELECT id, name, username, avatar FROM users WHERE id = ?", [senderId]);
      const last = getSQL("SELECT id, createdAt FROM messages WHERE senderId=? AND receiverId=? ORDER BY id DESC LIMIT 1", [senderId, receiverId]);
      const msg = { _id: last?.id, senderId: sender, receiverId, text: text.trim(), createdAt: last?.createdAt || new Date().toISOString(), read: 0 };
      const rs = onlineUsers.get(String(receiverId));
      if (rs) io.to(rs).emit("message:new", msg);
      socket.emit("message:sent", msg);
    } catch (e) { socket.emit("error", { msg: e.message }); }
  });

  socket.on("group:message", (data) => {
    try {
      const { senderId, groupId, text } = data;
      if (!text?.trim()) return;
      if (!getSQL("SELECT id FROM group_members WHERE groupId=? AND userId=?", [groupId, senderId])) return;
      runSQL("INSERT INTO messages (senderId, groupId, text) VALUES (?,?,?)", [senderId, groupId, text.trim()]);
      const sender = getSQL("SELECT id, name, username, avatar FROM users WHERE id = ?", [senderId]);
      const last = getSQL("SELECT id, createdAt FROM messages WHERE senderId=? AND groupId=? ORDER BY id DESC LIMIT 1", [senderId, groupId]);
      const msg = { _id: last?.id, senderId: sender, groupId, text: text.trim(), createdAt: last?.createdAt || new Date().toISOString() };
      io.to(`group:${groupId}`).emit("group:message:new", msg);
    } catch (e) {}
  });

  socket.on("typing:start", ({ userId, receiverId }) => {
    const rs = onlineUsers.get(String(receiverId));
    if (rs) io.to(rs).emit("typing:active", { userId });
  });

  socket.on("typing:stop", ({ userId, receiverId }) => {
    const rs = onlineUsers.get(String(receiverId));
    if (rs) io.to(rs).emit("typing:inactive", { userId });
  });

  socket.on("group:typing:start", ({ userId, groupId }) => {
    socket.to(`group:${groupId}`).emit("group:typing:active", { userId, groupId });
  });

  socket.on("group:typing:stop", ({ userId, groupId }) => {
    socket.to(`group:${groupId}`).emit("group:typing:inactive", { userId, groupId });
  });

  socket.on("messages:read", ({ userId, senderId }) => {
    runSQL("UPDATE messages SET read = 1 WHERE senderId=? AND receiverId=? AND read=0", [senderId, userId]);
    const ss = onlineUsers.get(String(senderId));
    if (ss) io.to(ss).emit("messages:read:ack", { readBy: userId });
  });

  socket.on("disconnect", () => {
    const uid = userSockets.get(socket.id);
    if (uid) {
      onlineUsers.delete(uid); userSockets.delete(socket.id);
      runSQL("UPDATE users SET online=0, lastSeen=CURRENT_TIMESTAMP WHERE id=?", [uid]);
      io.emit("user:status", { userId: uid, online: false });
    }
  });
});

initDatabase().then(() => {
  httpServer.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
});
