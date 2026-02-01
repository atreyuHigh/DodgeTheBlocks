// game.js - complete Dodge the Blocks implementation
// Small, clear functions with comments explaining each part.

// ---- DOM and canvas setup ----
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-btn');

// ---- Game state ----
let running = false;            // whether the game loop is running
let lastTime = 0;              // timestamp of last frame
let elapsed = 0;               // time since game start (seconds)
let spawnTimer = 0;            // time accumulator for spawning blocks
let spawnInterval = 0.9;       // seconds between spawns (will decrease)
const blocks = [];             // active falling blocks

// ---- Player description ----
const player = {
  w: 28,
  h: 18,
  x: canvas.width / 2 - 24,
  y: canvas.height - 80,
  speed: 280,   // horizontal speed in px/s
  vx: 0         // current horizontal velocity (-1 left, 1 right)
};

// Input state
const keys = { left: false, right: false };

// ---- Utilities ----
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(min, max) { return Math.random() * (max - min) + min; }

// ---- Game functions ----
// Reset game state for a new run
function resetGame() {
  running = false;
  lastTime = 0;
  elapsed = 0;
  spawnTimer = 0;
  spawnInterval = 0.9;
  blocks.length = 0;
  player.x = canvas.width / 2 - player.w / 2;
  player.y = canvas.height - player.h - 20;
  keys.left = keys.right = false;
  updateScoreDisplay(0);
}

// Start the game loop
function startGame() {
  resetGame();
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

// End the game
function endGame() {
  running = false;
}

// Spawn a new falling block at a random x with random size
function spawnBlock() {
  const bw = Math.floor(rand(30, 70));
  const bx = Math.floor(rand(0, canvas.width - bw));
  const speedBase = 120 + elapsed * 20; // base speed increases with time
  const b = { x: bx, y: -bw, w: bw, h: bw, speed: speedBase + rand(0, 60) };
  // Randomly assign a shape to the block: 'rect' or 'circle'
  b.shape = Math.random() < 0.5 ? 'rect' : 'circle';
  blocks.push(b);
}

// Update positions and game logic
function update(dt) {
  // update elapsed time and difficulty
  elapsed += dt;

  // tighten spawn interval slowly (min 0.28s)
  spawnInterval = clamp(0.9 - elapsed * 0.02, 0.28, 0.9);

  // handle player movement
  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  player.x += dir * player.speed * dt;
  player.x = clamp(player.x, 0, canvas.width - player.w);

  // spawn new blocks when timer passes interval
  spawnTimer += dt;
  if (spawnTimer >= spawnInterval) {
    spawnBlock();
    spawnTimer = 0;
  }

  // update blocks positions and remove off-screen ones
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    b.y += b.speed * dt;
    if (b.y > canvas.height) blocks.splice(i, 1);
    else if (checkCollision(player, b)) {
      // collision -> game over
      endGame();
    }
  }
}

// Draw player and blocks
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw player
  ctx.fillStyle = '#4ee3a4';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // draw blocks with shape variation
  for (const b of blocks) {
    if (b.shape === 'circle') {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
  }
}

// Main loop using requestAnimationFrame
function loop(now) {
  if (!running) return;
  const dt = (now - lastTime) / 1000; // convert ms to seconds
  lastTime = now;
  update(dt);
  draw();
  updateScoreDisplay(elapsed);
  requestAnimationFrame(loop);
}

// Check axis-aligned bounding box collision between two rects
function checkCollision(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Update visible score HUD
function updateScoreDisplay(t) {
  scoreEl.textContent = 'Score: ' + formatTime(t);
}

// Format time in seconds with two decimals
function formatTime(t) { return t.toFixed(2); }

// Input handlers
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});

// Buttons
startBtn.addEventListener('click', () => {
  if (!running) startGame();
});

// Initialize position and HUD on load
resetGame();

