/**
 * Classic Snake Mini-Game
 * Universal retro arcade game for casual users with on-screen D-Pad and keyboard support.
 */

export function initSnakeGame(containerId = 'snake-game-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('#snake-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const scoreEl = container.querySelector('#snake-score');
  const highScoreEl = container.querySelector('#snake-highscore');
  const startBtn = container.querySelector('#snake-start-btn');
  const statusBanner = container.querySelector('#snake-status-banner');

  const GRID_SIZE = 20;
  const CELL_COUNT = 20; // 20x20 grid -> 400x400 canvas
  const CANVAS_SIZE = GRID_SIZE * CELL_COUNT;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  // Audio Synthesizer
  let audioCtx = null;
  function playBeep(freq, duration = 0.08, type = 'sine') {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  // State
  let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let food = { x: 15, y: 10 };
  let score = 0;
  let highScore = parseInt(localStorage.getItem('vibe_snake_highscore') || '0', 10);
  if (highScoreEl) highScoreEl.textContent = highScore;

  let isPlaying = false;
  let isGameOver = false;
  let gameInterval = null;
  let speed = 120; // ms per tick

  function spawnFood() {
    let valid = false;
    while (!valid) {
      food = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT)
      };
      valid = !snake.some((segment) => segment.x === food.x && segment.y === food.y);
    }
  }

  function step() {
    if (!isPlaying || isGameOver) return;

    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wall Collision
    if (head.x < 0 || head.x >= CELL_COUNT || head.y < 0 || head.y >= CELL_COUNT) {
      gameOver();
      return;
    }

    // Self Collision
    if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // Food Eaten
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      if (scoreEl) scoreEl.textContent = score;
      if (score > highScore) {
        highScore = score;
        if (highScoreEl) highScoreEl.textContent = highScore;
        localStorage.setItem('vibe_snake_highscore', highScore);
      }
      playBeep(640, 0.1, 'sine');
      spawnFood();

      // Dynamic Speed Ramp
      if (speed > 60 && score % 40 === 0) {
        speed = Math.max(60, speed - 8);
        clearInterval(gameInterval);
        gameInterval = setInterval(step, speed);
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    // Clear canvas with deep dark background
    ctx.fillStyle = '#060912';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CELL_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(canvas.width, i * GRID_SIZE);
      ctx.stroke();
    }

    // Draw Food (Glowing Apple Diamond)
    ctx.save();
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    const fx = food.x * GRID_SIZE + GRID_SIZE / 2;
    const fy = food.y * GRID_SIZE + GRID_SIZE / 2;
    ctx.arc(fx, fy, GRID_SIZE / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Snake
    snake.forEach((seg, index) => {
      ctx.save();
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#00f2fe' : '#8b5cf6';
      ctx.shadowColor = isHead ? '#00f2fe' : '#8b5cf6';
      ctx.shadowBlur = isHead ? 10 : 4;

      const px = seg.x * GRID_SIZE + 1;
      const py = seg.y * GRID_SIZE + 1;
      const sz = GRID_SIZE - 2;

      ctx.beginPath();
      ctx.roundRect(px, py, sz, sz, isHead ? 6 : 4);
      ctx.fill();

      // Snake eyes on head
      if (isHead) {
        ctx.fillStyle = '#05070d';
        ctx.shadowBlur = 0;
        let eyeX1 = px + 4, eyeY1 = py + 4, eyeX2 = px + 11, eyeY2 = py + 4;
        if (direction.y === 1) { eyeY1 = eyeY2 = py + 11; }
        else if (direction.x === -1) { eyeX1 = eyeX2 = px + 4; eyeY1 = py + 4; eyeY2 = py + 11; }
        else if (direction.x === 1) { eyeX1 = eyeX2 = px + 11; eyeY1 = py + 4; eyeY2 = py + 11; }
        ctx.fillRect(eyeX1, eyeY1, 3, 3);
        ctx.fillRect(eyeX2, eyeY2, 3, 3);
      }
      ctx.restore();
    });

    // Overlay if not playing
    if (!isPlaying && !isGameOver) {
      ctx.fillStyle = 'rgba(6, 9, 18, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#00f2fe';
      ctx.textAlign = 'center';
      ctx.fillText('CLASSIC SNAKE // لعبة الثعبان', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Use Arrows or D-Pad below to Play', canvas.width / 2, canvas.height / 2 + 16);
    } else if (isGameOver) {
      ctx.fillStyle = 'rgba(6, 9, 18, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#f43f5e';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER (انتهت الجولة)', canvas.width / 2, canvas.height / 2 - 12);
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Score: ${score} | High: ${highScore}`, canvas.width / 2, canvas.height / 2 + 14);
    }
  }

  function gameOver() {
    isPlaying = false;
    isGameOver = true;
    clearInterval(gameInterval);
    if (statusBanner) statusBanner.textContent = 'Collision! Tap Start Game to try again.';
    if (startBtn) startBtn.textContent = 'Play Again';
    playBeep(180, 0.25, 'sawtooth');
    draw();
  }

  function startGame() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    speed = 120;
    if (scoreEl) scoreEl.textContent = '0';
    isPlaying = true;
    isGameOver = false;
    spawnFood();
    if (statusBanner) statusBanner.textContent = 'Snake active! Collect red diamonds.';
    if (startBtn) startBtn.textContent = 'Restart Game';
    clearInterval(gameInterval);
    gameInterval = setInterval(step, speed);
    draw();
  }

  function changeDirection(newDir) {
    if (!isPlaying) {
      startGame();
    }
    // Prevent 180-degree instant reversal
    if (newDir.x === -direction.x && newDir.y === -direction.y) return;
    nextDirection = newDir;
  }

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) {
      if (container.offsetParent !== null) e.preventDefault();
      changeDirection({ x: 0, y: -1 });
    } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
      if (container.offsetParent !== null) e.preventDefault();
      changeDirection({ x: 0, y: 1 });
    } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
      if (container.offsetParent !== null) e.preventDefault();
      changeDirection({ x: -1, y: 0 });
    } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
      if (container.offsetParent !== null) e.preventDefault();
      changeDirection({ x: 1, y: 0 });
    }
  });

  // Touch & D-Pad Buttons
  const btnUp = container.querySelector('#dpad-up');
  const btnDown = container.querySelector('#dpad-down');
  const btnLeft = container.querySelector('#dpad-left');
  const btnRight = container.querySelector('#dpad-right');

  if (btnUp) btnUp.addEventListener('click', () => changeDirection({ x: 0, y: -1 }));
  if (btnDown) btnDown.addEventListener('click', () => changeDirection({ x: 0, y: 1 }));
  if (btnLeft) btnLeft.addEventListener('click', () => changeDirection({ x: -1, y: 0 }));
  if (btnRight) btnRight.addEventListener('click', () => changeDirection({ x: 1, y: 0 }));

  if (startBtn) {
    startBtn.addEventListener('click', startGame);
  }

  // Initial draw
  draw();
}
