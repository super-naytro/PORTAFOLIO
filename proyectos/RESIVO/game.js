const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keys = {};
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

// --- Jugador ---
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 30,
  speed: 4,
  bullets: [],
  cooldown: 0,
  color: "cyan",
  name: "Jugador",
  ship: "sword",
  health: 100,
  maxHealth: 100,
  damage: 10
};

// --- Enemigos ---
let enemies = [];
let gameStarted = false;

// Definir naves con estadísticas
const ships = {
  sword: { color: "cyan", damage: 10, health: 100 },
  lanza: { color: "blue", damage: 25, health: 90 },
  daga: { color: "green", damage: 5, health: 110 },
  neon: { color: "orange", damage: 20, health: 120 },
  plata: { color: "silver", damage: 30, health: 80 },
  cristal: { color: "purple", damage: 15, health: 150 }
};

// Definir tipos de enemigos
const enemyTypes = [
  { color: "red", health: 30, speed: 2 },
  { color: "darkred", health: 50, speed: 1.5 },
  { color: "maroon", health: 80, speed: 1 }
];

// Eventos teclado
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Eventos mouse
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
canvas.addEventListener("click", () => shoot());

// --- Botón de inicio ---
document.getElementById("startBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("playerName").value.trim();
  const shipSelect = document.getElementById("shipSelect").value;

  if (nameInput) player.name = nameInput;
  player.ship = shipSelect;

  // Aplicar estadísticas de la nave
  const s = ships[shipSelect];
  player.color = s.color;
  player.damage = s.damage;
  player.health = s.health;
  player.maxHealth = s.health;

  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  gameStarted = true;
  loop();
  setInterval(spawnEnemy, 2000);
});

// Disparo
function shoot() {
  if (player.cooldown <= 0 && gameStarted) {
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

    if (player.ship === "sword") {
      // Disparo normal
      createBullet(angle);

    } else if (player.ship === "lanza") {
      // Dispara 2 proyectiles paralelos
      createBullet(angle, 8);
      createBullet(angle, -8);

    } else if (player.ship === "daga") {
      // Dispara ráfaga rápida
      createBullet(angle);
      player.cooldown = 7; // dispara más rápido

    } else if (player.ship === "neon") {
      // Dispara 3 balas en abanico
      createBullet(angle - 0.2);
      createBullet(angle);
      createBullet(angle + 0.2);

    } else if (player.ship === "plata") {
      // Un solo disparo pero más grande y lento
      createBullet(angle, 0, 10);

    } else if (player.ship === "cristal") {
      // Dispara 5 en abanico ancho
      for (let i = -2; i <= 2; i++) {
        createBullet(angle + i * 0.15);
      }
    }

    player.cooldown = player.cooldown || 15; // valor default si no lo cambiamos
  }
}

// Función auxiliar para crear balas
function createBullet(angle, offset = 0, size = 5) {
  player.bullets.push({
    x: player.x + Math.cos(angle + Math.PI/2) * offset,
    y: player.y + Math.sin(angle + Math.PI/2) * offset,
    size: size,
    speed: 8,
    dx: Math.cos(angle) * 8,
    dy: Math.sin(angle) * 8,
    damage: player.damage
  });
}

// Spawnear enemigos
function spawnEnemy() {
  if (!gameStarted) return;

  const side = Math.floor(Math.random() * 4);
  let x, y;
  if (side === 0) { x = 0; y = Math.random() * canvas.height; }
  if (side === 1) { x = canvas.width; y = Math.random() * canvas.height; }
  if (side === 2) { x = Math.random() * canvas.width; y = 0; }
  if (side === 3) { x = Math.random() * canvas.width; y = canvas.height; }

  // Tipo de enemigo aleatorio
  const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

  enemies.push({ 
    x, 
    y, 
    size: 20, 
    speed: type.speed, 
    color: type.color, 
    health: type.health,
    maxHealth: type.health
  });
}

// Update del juego
function update() {
  if (!gameStarted) return;

  // Movimiento jugador
  if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
  if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
  if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;

  // Limitar al canvas
  player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
  player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

  // Balas
  player.bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x < 0 || b.y < 0 || b.x > canvas.width || b.y > canvas.height) {
      player.bullets.splice(i, 1);
    }
  });

  // Enemigos
  enemies.forEach((e, i) => {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;

    // Colisión con jugador
    const distPlayer = Math.hypot(player.x - e.x, player.y - e.y);
    if (distPlayer < player.size / 2 + e.size / 2) {
      player.health -= 20; // daño fijo del kamikaze
      enemies.splice(i, 1);
      if (player.health <= 0) {
        alert("¡Has sido destruido!");
        document.location.reload();
      }
    }

    // Colisión con balas
    player.bullets.forEach((b, j) => {
      const distBullet = Math.hypot(b.x - e.x, b.y - e.y);
      if (distBullet < e.size / 2 + b.size / 2) {
        e.health -= b.damage;
        player.bullets.splice(j, 1);
        if (e.health <= 0) enemies.splice(i, 1);
      }
    });
  });

  if (player.cooldown > 0) player.cooldown--;
}

// Dibujar
function draw() {
  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jugador
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);

  // Nombre del jugador
  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(player.name, player.x, player.y - player.size);

  // Barra de vida del jugador
  ctx.fillStyle = "red";
  ctx.fillRect(player.x - 20, player.y + player.size, 40, 5);
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x - 20, player.y + player.size, 40 * (player.health / player.maxHealth), 5);

  // Balas
  ctx.fillStyle = "yellow";
  player.bullets.forEach(b => {
    ctx.fillRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size);
  });

  // Enemigos
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);

    // Barra de vida del enemigo
    ctx.fillStyle = "red";
    ctx.fillRect(e.x - 15, e.y - e.size, 30, 4);
    ctx.fillStyle = "lime";
    ctx.fillRect(e.x - 15, e.y - e.size, 30 * (e.health / e.maxHealth), 4);
  });
}

// Bucle principal
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Llamar al inicio
