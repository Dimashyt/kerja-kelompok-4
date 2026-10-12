async function sendTicketEmail(recipientEmail, buyerName, ticketName, ticketId) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'Hoyofest <tiket@dimasxcv.my.id>';
    if (!apiKey || !recipientEmail) return;

    const orderId = 'HOYO' + String(ticketId).padStart(5, '0') + 'X';
    const htmlTemplate = `
    <div style="background-color: #f7ede2; padding: 25px 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 440px; margin: 0 auto; background: #FFA834; border-radius: 28px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.18);">
        <div style="padding: 12px 12px 0 12px;">
          <img src="https://upload-os-bbs.hoyolab.com/upload/2026/07/01/45b54ad57e6bf9a730031c136aa4249e_4128803920028948272.png" alt="Hoyofest Banner" style="width: 100%; border-radius: 20px; display: block;" />
        </div>
        <div style="padding: 24px 22px;">
          <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 20px 0;">Hoyo Fest — ${ticketName}</h2>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #2b0b00;">📍 Lokasi</p>
            <p style="margin: 2px 0 0 0; font-size: 14px; color: #1a0500;">Pd. Pinang, Kec. Kebayoran Lama, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta</p>
          </div>

          <table style="width: 100%; margin-bottom: 15px; border-collapse: collapse;">
            <tr>
              <td style="width: 50%;">
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #2b0b00;">📅 Tanggal</p>
                <p style="margin: 2px 0 0 0; font-size: 14px; color: #1a0500;">12/11/2026</p>
              </td>
              <td style="width: 50%;">
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #2b0b00;">⏰ Waktu</p>
                <p style="margin: 2px 0 0 0; font-size: 14px; color: #1a0500;">10:46 WIB</p>
              </td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="vertical-align: top; width: 55%;">
                <div style="margin-bottom: 14px;">
                  <p style="margin: 0; font-size: 13px; font-weight: 700; color: #2b0b00;">ID Pesanan</p>
                  <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #1a0500;">${orderId}</p>
                </div>
                <div style="margin-bottom: 14px;">
                  <p style="margin: 0; font-size: 13px; font-weight: 700; color: #2b0b00;">Nama</p>
                  <p style="margin: 2px 0 0 0; font-size: 15px; font-weight: 700; color: #1a0500;">${buyerName}</p>
                </div>
                <div>
                  <p style="margin: 0; font-size: 13px; font-weight: 700; color: #2b0b00;">Kategori</p>
                  <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #1a0500;">${ticketName}</p>
                </div>
              </td>
              <td style="vertical-align: middle; text-align: right; width: 45%;">
                <div style="display: inline-block; background: #ffffff; padding: 10px; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&margin=0&data=${encodeURIComponent(orderId + ' - ' + buyerName + ' - ' + ticketName)}" alt="QR Code Tiket" style="display: block; width: 130px; height: 130px;" />
                </div>
              </td>
            </tr>
          </table>

          <div style="text-align: center;">
            <div style="display: inline-block; background-color: #6e1327; color: #ffffff; padding: 10px 28px; border-radius: 50px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">
              TIKET RESMI — VALID
            </div>
            <p style="font-size: 12px; color: #3b1000; margin: 10px 0 0 0;">Tunjukkan bukti tiket email ini saat tiba di pintu masuk event Hoyofest.</p>
          </div>
        </div>
      </div>
    </div>
    `;

    try {
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromEmail,
                to: recipientEmail,
                subject: `E-Tiket Hoyofest: ${ticketName}`,
                html: htmlTemplate
            })
        });
    } catch (e) {
        console.log('Gagal kirim email tiket:', e.message);
    }
}

module.exports = { sendTicketEmail };
