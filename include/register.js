function showError(msg) {
    const el = document.getElementById('regError');
    el.textContent = msg;
    el.classList.add('show');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

document.getElementById('btnRegister').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    document.getElementById('regError').classList.remove('show');

    if (!username || !password || !confirm) {
        showError('Please fill in all fields.');
        return;
    }
    if (username.length < 2 || username.length > 20) {
        showError('Username must be 2-20 characters.');
        return;
    }
    if (password.length < 4) {
        showError('Password must be at least 4 characters.');
        return;
    }
    if (password !== confirm) {
        showError('Passwords do not match.');
        return;
    }

    // Try PHP backend
    fetch('include/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('breakout_user', JSON.stringify(data.user));
                showToast('Account created!');
                setTimeout(() => window.location.href = 'game.html', 800);
            } else {
                showError(data.message || 'Registration failed.');
            }
        })
        .catch(() => {
            // Fallback: localStorage registration
            const users = JSON.parse(localStorage.getItem('breakout_users') || '[]');
            if (users.find(u => u.username === username)) {
                showError('Username already taken.');
                return;
            }
            const newUser = { id: Date.now(), username, password };
            users.push(newUser);
            localStorage.setItem('breakout_users', JSON.stringify(users));
            localStorage.setItem('breakout_user', JSON.stringify({ id: newUser.id, username }));
            showToast('Account created!');
            setTimeout(() => window.location.href = 'game.html', 800);
        });
});

// Enter key
document.getElementById('confirmPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btnRegister').click();
});