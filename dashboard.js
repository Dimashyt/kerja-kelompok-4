document.addEventListener('DOMContentLoaded', () => {
  const adminUser = sessionStorage.getItem('admin_user');
  if (!adminUser) {
    alert('Akses ditolak! Silakan login sebagai admin terlebih dahulu.');
    window.location.href = 'login.html';
    return;
  }

  // button ni penat cuk
  const openBtn = document.getElementById('opn-profile');
  const closeBtn = document.getElementById('cls-profile');
  const profileCard = document.getElementById('profile-card');

  openBtn.addEventListener('click', () => {
    profileCard.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    profileCard.style.display = 'none';
  });
  //end ni profile
  renderCurrentDate();
  setupFilterButtons();
  setupSearch();
  loadAdminProfile();
  loadTicketsFromDatabase();
});

function loadAdminProfile() {
  const adminName = sessionStorage.getItem('admin_user');
  const welcomeEl = document.getElementById('welcomeAdmin');
  if (adminName && welcomeEl) {
    welcomeEl.textContent = `Halo, ${adminName} 👋`;
  }
}

function renderCurrentDate() {
  const dateElement = document.getElementById('currentDate');
  if (!dateElement) return;

  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  dateElement.textContent = now.toLocaleDateString('id-ID', options);
}

async function loadTicketsFromDatabase() {
  try {
    const apiUrl = window.location.origin.includes(':3000') ? '/api/tickets' : 'http://localhost:3000/api/tickets';
    const response = await fetch(apiUrl);
    if (!response.ok) {
      updateStats();
      return;
    }

    const tickets = await response.json();
    if (!Array.isArray(tickets) || tickets.length === 0) {
      updateStats();
      return;
    }

    const container = document.getElementById('ticketsList');
    container.innerHTML = '';

    tickets.forEach(t => {
      const status = t.status || 'active';
      const isUsed = status === 'used' || status === 'tidak_aktif';
      const orderId = 'HOYO' + String(t.id).padStart(5, '0') + 'X';

      const card = document.createElement('div');
      card.className = 'ticket-card';
      card.setAttribute('data-status', isUsed ? 'used' : 'active');
      card.innerHTML = `
        <div class="ticket-banner">
          <img src="https://upload-os-bbs.hoyolab.com/upload/2026/07/01/45b54ad57e6bf9a730031c136aa4249e_4128803920028948272.png" alt="Hoyofest Banner" class="banner-img" />
          <span class="badge-date">12 NOV</span>
          <span class="badge-status ${isUsed ? 'status-used' : 'status-active'}">${isUsed ? 'Tidak aktif' : 'Tiket aktif'}</span>
        </div>
        <div class="ticket-body">
          <h3 class="ticket-title">${t.jenis_tiket || 'Hoyo Fest Ticket'}</h3>
          <div class="ticket-meta">
            <p><i class="ri-time-line"></i> 12 November 2026 · 10:00 WIB</p>
            <p><i class="ri-map-pin-2-fill"></i> Prov.Riau, Kec.Bengkalis, Kab.Bengkalis, Senggoro</p>
          </div>
          <div class="ticket-detail-grid">
            <div class="detail-col">
              <span class="detail-label">Nama</span>
              <strong class="detail-value buyer-name">${t.nama_pembeli || 'Pengunjung'}</strong>
              <span class="detail-label">ID Pesanan</span>
              <strong class="detail-value order-id">${orderId}</strong>
            </div>
            <div class="detail-col">
              <span class="detail-label">Kategori</span>
              <strong class="detail-value">${t.jenis_tiket || 'Standard'}</strong>
              <span class="detail-label">Status Verifikasi</span>
              <span class="tag-status ${isUsed ? 'tag-done' : 'tag-ready'}">${isUsed ? 'Sudah Masuk Venue' : 'Menunggu Scan Gate'}</span>
            </div>
          </div>  
          <div class="ticket-footer">
            <span class="ticket-qty">${t.jumlah || 1} tiket</span>
            <span class="ticket-state ${isUsed ? 'state-invalid' : 'state-valid'}">
              <i class="${isUsed ? 'ri-qr-scan-2-line' : 'ri-checkbox-circle-fill'}"></i> 
              ${isUsed ? 'Sudah Di-scan di Gate' : 'Siap Scan di Gate'}
            </span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    updateStats();
  } catch (err) {
    updateStats();
  }
}

function setupFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterType = btn.getAttribute('data-filter');
      applyFilters(filterType, document.getElementById('searchInput').value);
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const filterType = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
    applyFilters(filterType, e.target.value);
  });
}

function applyFilters(filterType, searchQuery) {
  const cards = document.querySelectorAll('.ticket-card');
  const query = (searchQuery || '').trim().toLowerCase();

  cards.forEach(card => {
    const cardStatus = card.getAttribute('data-status');
    const buyerName = card.querySelector('.buyer-name')?.textContent.toLowerCase() || '';
    const orderId = card.querySelector('.order-id')?.textContent.toLowerCase() || '';

    const matchesFilter = (filterType === 'all') || (cardStatus === filterType);
    const matchesSearch = query === '' || buyerName.includes(query) || orderId.includes(query);

    if (matchesFilter && matchesSearch) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function updateStats() {
  const allCards = document.querySelectorAll('.ticket-card');
  let activeCount = 0;
  let usedCount = 0;

  allCards.forEach(card => {
    if (card.getAttribute('data-status') === 'active') {
      activeCount++;
    } else if (card.getAttribute('data-status') === 'used') {
      usedCount++;
    }
  });

  const countActiveEl = document.getElementById('countActive');
  const countUsedEl = document.getElementById('countUsed');
  const countTotalEl = document.getElementById('countTotal');

  if (countActiveEl) countActiveEl.textContent = `${activeCount} tiket`;
  if (countUsedEl) countUsedEl.textContent = `${usedCount} tiket`;
  if (countTotalEl) countTotalEl.textContent = `${allCards.length} tiket`;
}
