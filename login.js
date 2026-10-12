document.querySelector('.Login__form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const apiUrl = window.location.origin.includes(':3000') ? '/api/login' : 'http://localhost:3000/api/login';
        const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });


        const result = await response.json();

        if (response.ok) {
            alert('Login Berhasil! Selamat datang ' + result.username);
            sessionStorage.setItem('admin_user', result.username);
            window.location.href = 'dashboard.html';
        } else {
            alert('Gagal Login: ' + result.error);
        }
    } catch (error) {
        alert('Gagal terhubung ke server. Pastikan server.js sudah jalan!');
    }
});
