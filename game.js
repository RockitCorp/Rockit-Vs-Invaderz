// =========================
// CANVAS SETUP
// =========================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =========================
// PLAYER (RED ROCKET SHIP)
// =========================
const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 60,
    w: 30,
    h: 40,
    speed: 5,
    cooldown: false,
    alive: true
};

// =========================
// GAME OBJECT ARRAYS
// =========================
let bullets = [];
let alienBullets = [];
let aliens = [];
let keys = {};
let lastAlienShot = 0;

// =========================
// CREATE ALIENS
// =========================
const alienRows = 3;
const alienCols = 6;

for (let r = 0; r < alienRows; r++) {
    for (let c = 0; c < alienCols; c++) {
        aliens.push({
            x: 80 + c * 70,
            y: 60 + r * 60,
            w: 40,
            h: 30,
            alive: true
        });
    }
}

let alienDirection = 1;

// =========================
// INPUT HANDLERS
// =========================
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// =========================
// MAIN LOOP
// =========================
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// =========================
// UPDATE LOGIC
// =========================
function update() {
    if (!player.alive) return;

    // Movement
    if (keys["ArrowLeft"] && player.x > 0)
        player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.w)
        player.x += player.speed;

    // Shooting
    if (keys[" "] && !player.cooldown) {
        bullets.push({
            x: player.x + player.w/2 - 3,
            y: player.y,
            w: 6,
            h: 12
        });
        player.cooldown = true;
        setTimeout(() => player.cooldown = false, 300);
    }

    // Bullet movement
    bullets.forEach(b => b.y -= 6);
    bullets = bullets.filter(b => b.y > -20);

    alienBullets.forEach(b => b.y += 4);
    alienBullets = alienBullets.filter(b => b.y < canvas.height + 20);

    // Alien movement
    let hitSide = false;
    aliens.forEach(a => {
        if (!a.alive) return;
        a.x += 1.2 * alienDirection;
        if (a.x <= 0 || a.x + a.w >= canvas.width) hitSide = true;
    });

    if (hitSide) {
        alienDirection *= -1;
        aliens.forEach(a => a.y += 20);
    }

    // Alien shooting
    if (performance.now() - lastAlienShot > 1000) {
        const shooters = aliens.filter(a => a.alive);
        if (shooters.length > 0) {
            const shooter = shooters[Math.floor(Math.random() * shooters.length)];
            alienBullets.push({
                x: shooter.x + shooter.w/2 - 3,
                y: shooter.y + shooter.h,
                w: 6,
                h: 12
            });
        }
        lastAlienShot = performance.now();
    }

    // Collisions: player bullets -> aliens
    bullets.forEach(b => {
        aliens.forEach(a => {
            if (a.alive &&
                b.x < a.x + a.w &&
                b.x + b.w > a.x &&
                b.y < a.y + a.h &&
                b.y + b.h > a.y) {

                a.alive = false;
                b.y = -999;
            }
        });
    });

    // Collisions: alien bullets -> player
    alienBullets.forEach(b => {
        if (b.x < player.x + player.w &&
            b.x + b.w > player.x &&
            b.y < player.y + player.h &&
            b.y + b.h > player.y) {
            player.alive = false;
        }
    });
}

// =========================
// DRAW EVERYTHING
// =========================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player (rocket)
    if (player.alive) {
        ctx.fillStyle = "red";
        ctx.fillRect(player.x, player.y, player.w, player.h);

        // Rocket tip
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x + player.w, player.y);
        ctx.lineTo(player.x + player.w/2, player.y - 15);
        ctx.fill();
    } else {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width/2 - 120, canvas.height/2);
        return;
    }

    // Player bullets
    ctx.fillStyle = "white";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    // Alien bullets
    ctx.fillStyle = "yellow";
    alienBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    // Aliens
    ctx.fillStyle = "lime";
    aliens.forEach(a => {
        if (a.alive) ctx.fillRect(a.x, a.y, a.w, a.h);
    });
}

loop();
