// Redirect if already logged in
const existing = JSON.parse(localStorage.getItem('breakout_user') || 'null');
if (existing) {
    const link = document.getElementById('nav-auth-link');
    link.textContent = existing.username;
    link.href = '#';
}

function showError(msg) {
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.classList.add('show');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

document.getElementById('btnLogin').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    document.getElementById('loginError').classList.remove('show');

    if (!username || !password) {
        showError('Please fill in all fields.');
        return;
    }

    // Try PHP backend
    fetch('include/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('breakout_user', JSON.stringify(data.user));
                showToast('Login successful!');
                setTimeout(() => window.location.href = 'game.html', 800);
            } else {
                showError(data.message || 'Invalid credentials.');
            }
        })
        .catch(() => {
            // Fallback: localStorage auth
            const users = JSON.parse(localStorage.getItem('breakout_users') || '[]');
            const found = users.find(u => u.username === username && u.password === password);
            if (found) {
                localStorage.setItem('breakout_user', JSON.stringify({ id: found.id, username: found.username }));
                showToast('Login successful!');
                setTimeout(() => window.location.href = 'game.html', 800);
            } else {
                showError('Invalid username or password.');
            }
        });
});

// Enter key
document.getElementById('password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btnLogin').click();
});