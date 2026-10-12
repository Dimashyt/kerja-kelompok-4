document.querySelector('.Login__form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (password !== confirmPassword) {
        alert('Password dan Confirm Password tidak cocok!');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Pendaftaran Berhasil! Silakan login.');
            window.location.href = 'login.html';
        } else {
            alert('Gagal daftar: ' + result.error);
        }
    } catch (error) {
        alert('Terjadi kesalahan jaringan atau server belum jalan.');
    }
});
