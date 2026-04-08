const currentUser = JSON.parse(localStorage.getItem('breakout_user') || 'null');

// Update nav
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

// Load leaderboard
function loadLeaderboard() {
    // Try PHP backend first
    fetch('include/leaderboard.php')
        .then(r => r.json())
        .then(data => renderLeaderboard(data))
        .catch(() => {
            // Fallback to localStorage
            const lb = JSON.parse(localStorage.getItem('breakout_leaderboard') || '[]');
            renderLeaderboard(lb);
        });
}

function renderLeaderboard(data) {
    const tbody = document.getElementById('lbBody');
    const table = document.getElementById('lbTable');
    const empty = document.getElementById('lbEmpty');

    if (!data || data.length === 0) {
        table.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    empty.style.display = 'none';
    tbody.innerHTML = '';

    data.slice(0, 20).forEach((entry, i) => {
        const rank = i + 1;
        let rankClass = '';
        let rankLabel = `#${rank}`;
        if (rank === 1) { rankClass = 'rank-gold'; rankLabel = '🥇'; }
        else if (rank === 2) { rankClass = 'rank-silver'; rankLabel = '🥈'; }
        else if (rank === 3) { rankClass = 'rank-bronze'; rankLabel = '🥉'; }

        const isYou = currentUser && entry.username === currentUser.username;

        const tr = document.createElement('tr');
        if (isYou) tr.className = 'your-row';
        tr.innerHTML = `
          <td class="${rankClass}">${rankLabel}</td>
          <td class="player-name">${entry.username}${isYou ? ' (you)' : ''}</td>
          <td class="player-score">${entry.score}</td>
          <td class="player-date">${entry.date || '—'}</td>
        `;
        tbody.appendChild(tr);
    });
}

loadLeaderboard();