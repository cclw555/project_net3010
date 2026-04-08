// Generate decorative floating bricks in the hero
const bricksContainer = document.getElementById('heroBricks');
const colors = ['#00f0ff', '#ff00aa', '#ffe600', '#39ff14', '#ff6a00'];
for (let i = 0; i < 18; i++) {
    const brick = document.createElement('div');
    brick.className = 'hero-brick';
    brick.style.width = (30 + Math.random() * 60) + 'px';
    brick.style.height = (14 + Math.random() * 20) + 'px';
    brick.style.left = Math.random() * 100 + '%';
    brick.style.top = Math.random() * 100 + '%';
    brick.style.background = colors[Math.floor(Math.random() * colors.length)];
    brick.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
    bricksContainer.appendChild(brick);
}

// Update nav auth link based on login state
const user = JSON.parse(localStorage.getItem('breakout_user') || 'null');
if (user) {
    const link = document.getElementById('nav-auth-link');
    link.textContent = user.username;
    link.href = '#';
    link.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Log out?')) {
            localStorage.removeItem('breakout_user');
            location.reload();
        }
    });
}