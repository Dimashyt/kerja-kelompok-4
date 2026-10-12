const params = new URLSearchParams(window.location.search);
const ticketId = params.get('id') || '1';
const buyerName = params.get('nama') || 'Pengunjung';
const buyerEmail = params.get('email') || 'email kamu';
const ticketType = params.get('tipe') || 'Tiket Event Normal';
const totalHarga = params.get('total') || '67000';

const orderId = 'HOYO' + String(ticketId).padStart(5, '0') + 'X';

document.addEventListener('DOMContentLoaded', () => {
  const elOrderId = document.getElementById('displayOrderId');
  const elTipe = document.getElementById('displayTipe');
  const elTotal = document.getElementById('displayTotal');

  if (elOrderId) elOrderId.textContent = orderId;
  if (elTipe) elTipe.textContent = ticketType;
  if (elTotal) elTotal.textContent = 'Rp ' + Number(totalHarga).toLocaleString('id-ID');
});

function konfirmasiBayar() {
  alert('Terima kasih! Pembayaran kamu berhasil diverifikasi.');
  window.location.href = `struk.html?id=${ticketId}&nama=${encodeURIComponent(buyerName)}&email=${encodeURIComponent(buyerEmail)}&tipe=${encodeURIComponent(ticketType)}&total=${totalHarga}`;
}
