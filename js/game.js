/**
 * Cyber Runner: Bug Dodger Arcade Mini-Game
 * A visual, accessible arcade canvas game with retro Web Audio effects and touch/keyboard controls.
 */

export function initArcadeGame(containerId = 'arcade-game-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('#cyber-game-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const scoreDisplay = container.querySelector('#game-score-display');
  const highScoreDisplay = container.querySelector('#game-highscore-display');
  const startBtn = container.querySelector('#game-start-btn');
  const muteBtn = container.querySelector('#game-mute-btn');
  const jumpBtn = container.querySelector('#game-jump-btn');

  let width = (canvas.width = 680);
  let height = (canvas.height = 240);

  // Audio Synthesizer (Zero external audio files needed)
  let audioMuted = false;
  let audioCtx = null;

  function playSound(type) {
    if (audioMuted) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'jump') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.14);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'token') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(900, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.28);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  // Game State
  let state = 'idle'; // 'idle' | 'playing' | 'gameover'
  let score = 0;
  let highScore = parseInt(localStorage.getItem('vibe_cyber_runner_highscore') || '0', 10);
  if (highScoreDisplay) highScoreDisplay.textContent = highScore;

  let speed = 4.5;
  let frame = 0;

  // Player Character
  const player = {
    x: 64,
    y: 170,
    width: 26,
    height: 32,
    dy: 0,
    jumpPower: -10.5,
    gravity: 0.58,
    groundY: 170,
    isGrounded: true,
  };

  // Entities
  let obstacles = [];
  let tokens = [];
  let particles = [];

  function resetGame() {
    score = 0;
    speed = 4.5;
    frame = 0;
    obstacles = [];
    tokens = [];
    particles = [];
    player.y = player.groundY;
    player.dy = 0;
    player.isGrounded = true;
    state = 'playing';
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (startBtn) startBtn.style.display = 'none';
  }

  function triggerJump() {
    if (state === 'idle' || state === 'gameover') {
      resetGame();
      playSound('jump');
      return;
    }

    if (player.isGrounded) {
      player.dy = player.jumpPower;
      player.isGrounded = false;
      playSound('jump');

      // Jump dust particles
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: player.x + player.width / 2,
          y: player.y + player.height,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * -2,
          size: Math.random() * 3 + 1,
          color: '#00f2fe',
          alpha: 1,
        });
      }
    }
  }

  function update() {
    if (state !== 'playing') return;

    frame++;
    speed = 4.5 + Math.min(score * 0.04, 5);

    // Player Physics
    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y >= player.groundY) {
      player.y = player.groundY;
      player.dy = 0;
      player.isGrounded = true;
    }

    // Spawn Obstacles (Bugs)
    if (frame % Math.max(70, Math.floor(120 - speed * 4)) === 0) {
      obstacles.push({
        x: width + 20,
        y: player.groundY + 4,
        width: 22,
        height: 28,
        color: '#f43f5e',
      });
    }

    // Spawn Energy Tokens
    if (frame % 150 === 0 && Math.random() > 0.3) {
      tokens.push({
        x: width + 30,
        y: player.groundY - 36 - Math.random() * 30,
        size: 14,
        color: '#00f2fe',
      });
    }

    // Update Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= speed;

      // Collision Check
      if (
        player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y
      ) {
        // Game Over
        state = 'gameover';
        playSound('crash');

        if (score > highScore) {
          highScore = score;
          localStorage.setItem('vibe_cyber_runner_highscore', highScore.toString());
          if (highScoreDisplay) highScoreDisplay.textContent = highScore;
        }

        if (startBtn) {
          startBtn.textContent = 'Restart Game';
          startBtn.style.display = 'inline-flex';
        }
        return;
      }

      // Remove offscreen
      if (obs.x + obs.width < 0) {
        obstacles.splice(i, 1);
        score += 1;
        if (scoreDisplay) scoreDisplay.textContent = score;
      }
    }

    // Update Tokens
    for (let i = tokens.length - 1; i >= 0; i--) {
      const tok = tokens[i];
      tok.x -= speed;

      // Token Collision
      if (
        player.x < tok.x + tok.size &&
        player.x + player.width > tok.x &&
        player.y < tok.y + tok.size &&
        player.y + player.height > tok.y
      ) {
        tokens.splice(i, 1);
        score += 10;
        playSound('token');
        if (scoreDisplay) scoreDisplay.textContent = score;

        // Sparkle particles
        for (let p = 0; p < 8; p++) {
          particles.push({
            x: tok.x,
            y: tok.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            size: Math.random() * 4 + 1,
            color: '#38bdf8',
            alpha: 1,
          });
        }
      }

      if (tok.x + tok.size < 0) {
        tokens.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Cyber Ground Track
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, player.groundY + player.height);
    ctx.lineTo(width, player.groundY + player.height);
    ctx.stroke();

    // Moving Ground Grid Dots
    ctx.fillStyle = '#334155';
    for (let x = (-(frame * speed) % 24); x < width; x += 24) {
      ctx.fillRect(x, player.groundY + player.height + 4, 3, 2);
    }

    // Draw Particles
    for (let p of particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Draw Tokens (Energy Diamonds)
    for (let tok of tokens) {
      ctx.save();
      ctx.translate(tok.x + tok.size / 2, tok.y + tok.size / 2);
      ctx.rotate((frame * 0.08) % (Math.PI * 2));
      ctx.fillStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, -tok.size / 2);
      ctx.lineTo(tok.size / 2, 0);
      ctx.lineTo(0, tok.size / 2);
      ctx.lineTo(-tok.size / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Draw Obstacles (Cyber Bugs)
    for (let obs of obstacles) {
      ctx.fillStyle = obs.color;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
      ctx.fill();

      // Bug Eye dots
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obs.x + 4, obs.y + 6, 3, 3);
      ctx.fillRect(obs.x + 15, obs.y + 6, 3, 3);
    }

    // Draw Player (Neon Cyber Bot Runner)
    ctx.save();
    ctx.fillStyle = '#8b5cf6';
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 12;

    // Body
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.width, player.height, 8);
    ctx.fill();

    // Visor
    ctx.fillStyle = '#00f2fe';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 8;
    ctx.fillRect(player.x + 6, player.y + 7, 16, 7);

    // Jet thruster trail when jumping
    if (!player.isGrounded) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(player.x + 5, player.y + player.height);
      ctx.lineTo(player.x + player.width / 2, player.y + player.height + 12);
      ctx.lineTo(player.x + player.width - 5, player.y + player.height);
      ctx.fill();
    }
    ctx.restore();

    // Idle & Game Over Overlays
    if (state === 'idle') {
      ctx.fillStyle = 'rgba(5, 7, 13, 0.75)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#00f2fe';
      ctx.textAlign = 'center';
      ctx.fillText('CYBER DASH &bull; BUG DODGER', width / 2, height / 2 - 14);

      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Press SPACE, Tap Screen or Click JUMP to play', width / 2, height / 2 + 16);
    } else if (state === 'gameover') {
      ctx.fillStyle = 'rgba(5, 7, 13, 0.8)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = 'bold 20px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#f43f5e';
      ctx.textAlign = 'center';
      ctx.fillText('FIREWALL BREACH &bull; GAME OVER', width / 2, height / 2 - 16);

      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Final Score: ${score}  |  Best: ${highScore}`, width / 2, height / 2 + 14);
    }
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();

  // Controls Event Listeners
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      // Prevent scrolling down when pressing space if game is focused
      if (document.activeElement === canvas || container.contains(document.activeElement)) {
        e.preventDefault();
      }
      triggerJump();
    }
  });

  canvas.addEventListener('click', triggerJump);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    triggerJump();
  });

  if (jumpBtn) {
    jumpBtn.addEventListener('click', triggerJump);
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      resetGame();
      playSound('jump');
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      audioMuted = !audioMuted;
      muteBtn.textContent = audioMuted ? 'Sound: OFF' : 'Sound: ON';
      muteBtn.classList.toggle('muted', audioMuted);
    });
  }
}
