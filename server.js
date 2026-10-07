const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hoyo_db'
});

db.connect((err) => {
    if (err) {
        console.log('MySQL gagal terhubung: ' + err.message);
        return;
    }
    console.log('Berhasil terhubung ke database MySQL (hoyo_db)!');
});

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/tickets' && req.method === 'GET') {
        db.query('SELECT * FROM tiket ORDER BY id DESC', (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
        return;
    }

    if (req.url === '/api/tickets' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { nama_pembeli, jenis_tiket, jumlah, total_harga } = JSON.parse(body);
                db.query('SELECT stok_tiket FROM daftar_tiket WHERE nama_tiket = ?', [jenis_tiket], (err, rows) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                        return;
                    }

                    if (rows.length === 0 || rows[0].stok_tiket < Number(jumlah)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Tiket habis, Tunggu dev isi lagi' }));
                        return;
                    }

                    const sqlInsert = 'INSERT INTO tiket (nama_pembeli, jenis_tiket, jumlah, total_harga) VALUES (?, ?, ?, ?)';
                    db.query(sqlInsert, [nama_pembeli, jenis_tiket, Number(jumlah), Number(total_harga)], (err, result) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: err.message }));
                            return;
                        }

                        const sqlUpdate = 'UPDATE daftar_tiket SET stok_tiket = stok_tiket - ? WHERE nama_tiket = ?';
                        db.query(sqlUpdate, [Number(jumlah), jenis_tiket], () => {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, ticketId: result.insertId }));
                        });
                    });
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Format data salah' }));
            }
        });
        return;
    }

    const cleanUrl = req.url.split('?')[0];
    let filePath = cleanUrl === '/' ? 'index.html' : cleanUrl;
    let fullPath = path.join(__dirname, decodeURIComponent(filePath));
    let ext = path.extname(fullPath).toLowerCase();
    let contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(fullPath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});
