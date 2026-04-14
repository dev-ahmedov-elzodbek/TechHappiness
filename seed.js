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

fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
console.log("\n🎉 Tayyor! Login uchun: email + parol: 123456");
