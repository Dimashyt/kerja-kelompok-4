document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const ticketId = params.get('id') || '1';
  const buyerName = params.get('nama') || 'Pengunjung';
  const buyerEmail = params.get('email') || 'email kamu';
  const ticketType = params.get('tipe') || 'Tiket Event Normal';
  const totalHarga = params.get('total') || '67000';

  const orderId = 'HOYO' + String(ticketId).padStart(5, '0') + 'X';

  const elNama = document.getElementById('displayNama');
  const elEmail = document.getElementById('displayEmail');
  const elOrderId = document.getElementById('displayOrderId');
  const elTipe = document.getElementById('displayTipe');
  const elTotal = document.getElementById('displayTotal');
  const elQr = document.getElementById('qrImg');

  if (elNama) elNama.textContent = buyerName;
  if (elEmail) elEmail.textContent = buyerEmail;
  if (elOrderId) elOrderId.textContent = orderId;
  if (elTipe) elTipe.textContent = ticketType;
  if (elTotal) elTotal.textContent = 'Rp ' + Number(totalHarga).toLocaleString('id-ID');

  if (elQr) {
    const qrData = `${orderId} - ${buyerName} - ${ticketType} - LUNAS`;
    elQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=270x270&margin=0&data=${encodeURIComponent(qrData)}`;
  }
});
