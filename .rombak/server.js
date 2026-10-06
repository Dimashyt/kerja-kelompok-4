// ===============================================================
// HOYOFEST BACKEND SERVER WITH NATIVE SQLITE DATABASE
// Built with Node.js built-in modules (node:http & node:sqlite)
// No extra downloads or external server installation required!
// ===============================================================

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = 5500;
const DB_PATH = path.join(__dirname, 'database.sqlite');

// 1. Inisialisasi Database SQLite
const db = new DatabaseSync(DB_PATH);

// Buat Tabel USERS dan TICKETS dengan Query SQL Standar
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ticket_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Masukkan data akun default (sesuai nama tim di About Us) jika database masih kosong
const countStmt = db.prepare('SELECT COUNT(*) as count FROM users');
const { count } = countStmt.get();

if (count === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)');
  insertUser.run('dimas', '123456', 'Dimas Hidayat');
  insertUser.run('ilhamdi', '123456', 'Ilhamdi Syahabana');
  insertUser.run('azizi', '123456', 'Azizi');
  console.log('✅ Database siap! Data pengguna awal (Dimas, Ilhamdi, Azizi) berhasil ditambahkan.');
}

// 2. Helper untuk membaca Request Body JSON
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper untuk respon JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// 3. MIME Types untuk Static Files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webp': 'image/webp'
};

// 4. Server Utama
const server = http.createServer(async (req, res) => {
  // Tangani CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // -------------------------------------------------------------
  // API ENDPOINTS
  // -------------------------------------------------------------

  // [POST] /api/login - Verifikasi Login ke Database SQL
  if (req.method === 'POST' && pathname === '/api/login') {
    try {
      const { username, password } = await readRequestBody(req);

      if (!username || !password) {
        return sendJSON(res, 400, { success: false, message: 'Username dan password wajib diisi!' });
      }

      // Query SQL SELECT
      const stmt = db.prepare('SELECT id, username, name FROM users WHERE username = ? AND password = ?');
      const user = stmt.get(username.trim(), password.trim());

      if (user) {
        return sendJSON(res, 200, {
          success: true,
          message: 'Login berhasil!',
          user: { id: user.id, username: user.username, name: user.name }
        });
      } else {
        return sendJSON(res, 401, { success: false, message: 'Username atau password salah!' });
      }
    } catch (err) {
      console.error('Error Login:', err);
      return sendJSON(res, 500, { success: false, message: 'Terjadi kesalahan pada server database.' });
    }
  }

  // [POST] /api/register - Buat Akun Baru ke Database SQL
  if (req.method === 'POST' && pathname === '/api/register') {
    try {
      const { username, password, name } = await readRequestBody(req);

      if (!username || !password || !name) {
        return sendJSON(res, 400, { success: false, message: 'Semua kolom wajib diisi!' });
      }

      // Cek apakah username sudah ada
      const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
      const existing = checkStmt.get(username.trim());

      if (existing) {
        return sendJSON(res, 409, { success: false, message: 'Username sudah digunakan, pilih username lain!' });
      }

      // Query SQL INSERT
      const insertStmt = db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)');
      const result = insertStmt.run(username.trim(), password.trim(), name.trim());

      return sendJSON(res, 201, {
        success: true,
        message: 'Registrasi berhasil! Silakan login.',
        user: { id: result.lastInsertRowid, username: username.trim(), name: name.trim() }
      });
    } catch (err) {
      console.error('Error Register:', err);
      return sendJSON(res, 500, { success: false, message: 'Gagal membuat akun baru.' });
    }
  }

  // [POST] /api/buy-ticket - Beli Tiket dan Simpan ke Tabel tickets
  if (req.method === 'POST' && pathname === '/api/buy-ticket') {
    try {
      const { userId, ticketType, quantity, totalPrice } = await readRequestBody(req);

      if (!userId || !ticketType || !quantity) {
        return sendJSON(res, 400, { success: false, message: 'Data pembelian tidak lengkap!' });
      }

      const insertTicket = db.prepare(
        'INSERT INTO tickets (user_id, ticket_type, quantity, total_price) VALUES (?, ?, ?, ?)'
      );
      const result = insertTicket.run(Number(userId), ticketType, Number(quantity), Number(totalPrice));

      return sendJSON(res, 200, {
        success: true,
        message: 'Pembelian tiket berhasil disimpan ke database!',
        ticketId: result.lastInsertRowid
      });
    } catch (err) {
      console.error('Error Buy Ticket:', err);
      return sendJSON(res, 500, { success: false, message: 'Gagal memproses pembelian tiket.' });
    }
  }

  // [GET] /api/users - Melihat Data Pengguna (Untuk bukti ke guru/dosen)
  if (req.method === 'GET' && pathname === '/api/users') {
    try {
      const stmt = db.prepare('SELECT id, username, name, created_at FROM users');
      const users = stmt.all();
      return sendJSON(res, 200, { success: true, users });
    } catch (err) {
      return sendJSON(res, 500, { success: false, message: 'Gagal membaca database.' });
    }
  }

  // -------------------------------------------------------------
  // STATIC FILE HANDLER (Melayani index.html, style.css, gambar)
  // -------------------------------------------------------------
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Decode URI component untuk nama file dengan spasi/simbol
  try {
    filePath = decodeURIComponent(filePath);
  } catch (e) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

// Jalankan Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Server Hoyofest & Database SQL aktif di:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`💾 File Database: ${DB_PATH}`);
  console.log(`👥 Akun Default: username 'dimas' | password '123456'`);
  console.log(`=======================================================`);
});
