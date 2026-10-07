const params = new URLSearchParams(window.location.search);
const tipe = params.get('tipe') || 'normal';

const tiketMap = {
  normal: { nama: 'Tiket Event Normal', harga: 67000 },
  unlimited: { nama: 'Tiket Event Unlimited', harga: 267000 },
  special: { nama: 'Paket 3 Special', harga: 167000 }
};

const tiket = tiketMap[tipe] || tiketMap.normal;

document.getElementById('displayNamaTiket').textContent = tiket.nama;
document.getElementById('displayHargaTiket').textContent = 'Rp ' + tiket.harga.toLocaleString('id-ID');
document.getElementById('displayTotal').textContent = 'Rp ' + tiket.harga.toLocaleString('id-ID');

document.getElementById('payForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();

  const payload = {
    nama_pembeli: `${username} (${email})`,
    jenis_tiket: tiket.nama,
    jumlah: 1,
    total_harga: tiket.harga
  };

  try {
    const apiUrl = window.location.origin.includes(':3000') ? '/api/tickets' : 'http://localhost:3000/api/tickets';
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert(`Pembayaran Berhasil! Tiket "${tiket.nama}" berhasil disimpan ke database MySQL (ID: #${data.ticketId})`);
      window.location.href = '../index.html';
    } else {
      alert('Gagal: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    alert('Gagal terhubung ke database.');
  }
});
