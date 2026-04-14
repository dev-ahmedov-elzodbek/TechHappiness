// Bu fayl test uchun namuna foydalanuvchilar yaratadi
// Ishlatish: node seed.js

import initSqlJs from "sql.js";
import bcryptjs from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "database.db");

const SQL = await initSqlJs();
let db;
if (fs.existsSync(DB_PATH)) {
  db = new SQL.Database(fs.readFileSync(DB_PATH));
} else {
  db = new SQL.Database();
}

// Create tables if they don't exist
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

const hash = (pw) => bcryptjs.hashSync(pw, 10);

const users = [
  { name: "Ali Karimov",    username: "ali_k",    email: "ali@test.com",    pw: "123456", avatar: "👋" },
  { name: "Malika Yusupova",username: "malika_y", email: "malika@test.com", pw: "123456", avatar: "🌟" },
  { name: "Jasur Toshmatov",username: "jasur_t",  email: "jasur@test.com",  pw: "123456", avatar: "🚀" },
  { name: "Dilnoza Ergasheva",username:"dilnoza_e",email:"dilnoza@test.com",pw:"123456",avatar:"🎯" },
  { name: "Bobur Xasanov",  username: "bobur_x",  email: "bobur@test.com",  pw: "123456", avatar: "⚡" },
];

for (const u of users) {
  try {
    db.run("INSERT INTO users (name, username, email, password, avatar) VALUES (?,?,?,?,?)",
      [u.name, u.username, u.email, hash(u.pw), u.avatar]);
    console.log(`✅ Qo'shildi: ${u.name} (@${u.username})`);
  } catch (e) {
    console.log(`⚠️  Mavjud: ${u.email}`);
  }
}

// Demo groups yaratish
const groups = [
  { name: "Frontend Muft", admin: 1, members: [1, 2, 3] },
  { name: "Backend Team", admin: 2, members: [2, 4, 5] },
  { name: "Design Squad", admin: 3, members: [1, 3, 5] },
];

for (const g of groups) {
  try {
    db.run("INSERT INTO groups (name, avatar, admin) VALUES (?,?,?)",
      [g.name, "👥", g.admin]);
    const result = db.exec("SELECT id FROM groups WHERE name = ? LIMIT 1", [g.name]);
    if (result[0]) {
      const groupId = result[0].values[0][0];
      for (const userId of g.members) {
        db.run("INSERT INTO group_members (groupId, userId) VALUES (?,?)", [groupId, userId]);
      }
      console.log(`✅ Guruh: ${g.name}`);
    }
  } catch (e) {
    console.log(`⚠️  Guruh xatosi: ${g.name}`);
  }
}

fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
console.log("\n🎉 Tayyor! Login uchun: email + parol: 123456");
