const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ── CONFIG ──
const CONFIG = {
    ball: { radius: 7, speed: 4 },
    paddle: { width: 100, height: 12, speed: 7, color: '#00f0ff' },
    brick: { rows: 4, cols: 8, width: 60, height: 22, padding: 8, offsetTop: 40, offsetLeft: 20 },
    colors: ['#ff00aa', '#ff6a00', '#ffe600', '#39ff14'],
};

// ── STATE ──
let score = 0;
let paused = false;
let gameOver = false;
let keysDown = {};

// ── BALL ──
class Ball {
    constructor() { this.reset(); }
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 60;
        this.r = CONFIG.ball.radius;
        const angle = -Math.PI / 4 - Math.random() * Math.PI / 2; // upward random
        this.vx = CONFIG.ball.speed * Math.cos(angle);
        this.vy = CONFIG.ball.speed * Math.sin(angle);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        // Wall bounces
        if (this.x - this.r < 0) { this.x = this.r; this.vx = Math.abs(this.vx); }
        if (this.x + this.r > canvas.width) { this.x = canvas.width - this.r; this.vx = -Math.abs(this.vx); }
        if (this.y - this.r < 0) { this.y = this.r; this.vy = Math.abs(this.vy); }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        // Glow
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }
}

// ── PADDLE ──
class Paddle {
    constructor() {
        this.w = CONFIG.paddle.width;
        this.h = CONFIG.paddle.height;
        this.y = canvas.height - 28;
        this.x = (canvas.width - this.w) / 2;
    }
    reset() {
        this.x = (canvas.width - this.w) / 2;
        this.w = CONFIG.paddle.width;
    }
    update() {
        if (keysDown['ArrowLeft']) this.x -= CONFIG.paddle.speed;
        if (keysDown['ArrowRight']) this.x += CONFIG.paddle.speed;
        // Clamp
        if (this.x < 0) this.x = 0;
        if (this.x + this.w > canvas.width) this.x = canvas.width - this.w;
    }
    draw() {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 6);
        ctx.fill();
        // Glow
        ctx.shadowColor = 'orange';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ── BRICK ──
class Brick {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.w = CONFIG.brick.width;
        this.h = CONFIG.brick.height;
        this.color = color;
        this.alive = true;
        this.opacity = 1;
    }
    draw() {
        if (!this.alive) return;
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 4);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h / 3);
        ctx.globalAlpha = 1;
    }
}

// ── INIT ──
const ball = new Ball();
const paddle = new Paddle();
let bricks = [];

function createBricks() {
    bricks = [];
    const { rows, cols, width, height, padding, offsetTop, offsetLeft } = CONFIG.brick;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = offsetLeft + c * (width + padding);
            const y = offsetTop + r * (height + padding);
            bricks.push(new Brick(x, y, CONFIG.colors[r % CONFIG.colors.length]));
        }
    }
}

// ── COLLISION ──
function checkBrickCollision() {
    for (const brick of bricks) {
        if (!brick.alive) continue;
        if (
            ball.x + ball.r > brick.x &&
            ball.x - ball.r < brick.x + brick.w &&
            ball.y + ball.r > brick.y &&
            ball.y - ball.r < brick.y + brick.h
        ) {
            // Determine side
            const overlapX = Math.min(ball.x + ball.r - brick.x, brick.x + brick.w - (ball.x - ball.r));
            const overlapY = Math.min(ball.y + ball.r - brick.y, brick.y + brick.h - (ball.y - ball.r));
            if (overlapX < overlapY) {
                ball.vx = -ball.vx;
            } else {
                ball.vy = -ball.vy;
            }
            brick.alive = false;
            score += 10;
            document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
            break; // one collision per frame
        }
    }
}

function checkPaddleCollision() {
    if (
        ball.y + ball.r >= paddle.y &&
        ball.y + ball.r <= paddle.y + paddle.h + 4 &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.w
    ) {
        // Angle based on hit position
        const hitPos = (ball.x - paddle.x) / paddle.w; // 0..1
        const angle = -Math.PI / 6 - (hitPos * Math.PI * 2 / 3); // -150° to -30°
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = speed * Math.cos(angle);
        ball.vy = speed * Math.sin(angle);
        ball.y = paddle.y - ball.r;
    }
}

// ── GAME FLOW ──
function endGame(won) {
    gameOver = true;
    const overlay = document.getElementById('gameOverlay');
    const title = document.getElementById('overlayTitle');
    const scoreEl = document.getElementById('overlayScore');
    overlay.classList.add('active');
    title.textContent = won ? 'YOU WIN!' : 'GAME OVER';
    title.className = 'overlay-title ' + (won ? 'win' : 'lose');
    scoreEl.textContent = `Score: ${score}`;

    // Submit score if logged in
    submitScore(score);
}

function resetGame() {
    score = 0;
    gameOver = false;
    paused = false;
    document.getElementById('scoreDisplay').textContent = 'Score: 0';
    document.getElementById('gameOverlay').classList.remove('active');
    document.getElementById('pauseBadge').classList.remove('active');
    ball.reset();
    paddle.reset();
    createBricks();
}

// ── SCORE SUBMISSION ──
function submitScore(finalScore) {
    const user = JSON.parse(localStorage.getItem('breakout_user') || 'null');
    if (!user) return; // only submit if logged in

    // Try PHP backend first, fallback to localStorage
    fetch('include/submit_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, score: finalScore })
    }).catch(() => {
        // Fallback: save to localStorage leaderboard
        const lb = JSON.parse(localStorage.getItem('breakout_leaderboard') || '[]');
        lb.push({ username: user.username, score: finalScore, date: new Date().toISOString().split('T')[0] });
        lb.sort((a, b) => b.score - a.score);
        localStorage.setItem('breakout_leaderboard', JSON.stringify(lb.slice(0, 50)));
    });
}

// ── DRAW ──
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(0,240,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    bricks.forEach(b => b.draw());
    paddle.draw();
    ball.draw();
}

// ── GAME LOOP ──
function gameLoop() {
    if (!gameOver) {
        if (!paused) {
            paddle.update();
            ball.update();
            checkBrickCollision();
            checkPaddleCollision();

            // Ball fell off
            if (ball.y - ball.r > canvas.height) {
                endGame(false);
            }

            // All bricks destroyed
            if (bricks.every(b => !b.alive)) {
                endGame(true);
            }
        }
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// ── INPUT ──
document.addEventListener('keydown', (e) => {
    keysDown[e.key] = true;
    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
        document.getElementById('pauseBadge').classList.toggle('active', paused);
        document.getElementById('btnPause').textContent = paused ? 'Resume' : 'Pause';
    }
    if (e.key === 'r' || e.key === 'R') resetGame();
});
document.addEventListener('keyup', (e) => { keysDown[e.key] = false; });

document.getElementById('btnPause').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBadge').classList.toggle('active', paused);
    document.getElementById('btnPause').textContent = paused ? 'Resume' : 'Pause';
});
document.getElementById('btnRestart').addEventListener('click', resetGame);
document.getElementById('btnOverlayRestart').addEventListener('click', resetGame);

// Auth nav link
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

// ── START ──
createBricks();
gameLoop();