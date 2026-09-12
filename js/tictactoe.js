/**
 * Tic-Tac-Toe (X-O) - Classic Casual Mini-Game
 * Accessible, instant-play casual game for all visitors with smart AI and score tracking.
 */

export function initTicTacToe(containerId = 'tictactoe-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Web Audio Synthesizer
  let audioCtx = null;
  function playNote(freq, duration = 0.12, type = 'sine') {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  // State
  let board = Array(9).fill(null);
  let currentPlayer = 'X'; // Human is always X
  let isGameOver = false;
  let gameMode = 'ai'; // 'ai' | '2p'
  let difficulty = 'normal'; // 'normal' | 'hard'

  let scores = {
    x: parseInt(localStorage.getItem('vibe_xo_score_x') || '0', 10),
    o: parseInt(localStorage.getItem('vibe_xo_score_o') || '0', 10),
    ties: parseInt(localStorage.getItem('vibe_xo_score_ties') || '0', 10),
  };

  // Winning combinations
  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  // DOM Elements
  const cells = container.querySelectorAll('.xo-cell');
  const statusEl = container.querySelector('#xo-status-banner');
  const scoreXEl = container.querySelector('#xo-score-x');
  const scoreOEl = container.querySelector('#xo-score-o');
  const scoreTiesEl = container.querySelector('#xo-score-ties');
  const resetBtn = container.querySelector('#xo-reset-btn');
  const modeAiBtn = container.querySelector('#xo-mode-ai');
  const modePvpBtn = container.querySelector('#xo-mode-pvp');

  function updateScoreboard() {
    if (scoreXEl) scoreXEl.textContent = scores.x;
    if (scoreOEl) scoreOEl.textContent = scores.o;
    if (scoreTiesEl) scoreTiesEl.textContent = scores.ties;
    localStorage.setItem('vibe_xo_score_x', scores.x);
    localStorage.setItem('vibe_xo_score_o', scores.o);
    localStorage.setItem('vibe_xo_score_ties', scores.ties);
  }

  function checkWinner(state) {
    for (let combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (state[a] && state[a] === state[b] && state[a] === state[c]) {
        return { winner: state[a], combo };
      }
    }
    if (state.every((cell) => cell !== null)) {
      return { winner: 'tie', combo: null };
    }
    return null;
  }

  function renderBoard() {
    cells.forEach((cell, idx) => {
      const val = board[idx];
      cell.className = 'xo-cell';
      cell.innerHTML = '';
      if (val === 'X') {
        cell.classList.add('cell-x');
        cell.innerHTML = `
          <svg class="xo-mark-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      } else if (val === 'O') {
        cell.classList.add('cell-o');
        cell.innerHTML = `
          <svg class="xo-mark-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="9"></circle>
          </svg>
        `;
      }
    });
  }

  function handleCellClick(e) {
    const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
    if (board[idx] !== null || isGameOver) return;

    // Player move
    makeMove(idx, currentPlayer);

    if (isGameOver) return;

    // If AI mode and game not over, trigger AI move
    if (gameMode === 'ai' && currentPlayer === 'O') {
      if (statusEl) statusEl.textContent = 'Thinking (AI)...';
      setTimeout(() => {
        if (!isGameOver) aiMove();
      }, 320);
    }
  }

  function makeMove(idx, player) {
    board[idx] = player;
    playNote(player === 'X' ? 440 : 550, 0.1, 'triangle');
    renderBoard();

    const result = checkWinner(board);
    if (result) {
      isGameOver = true;
      if (result.winner === 'tie') {
        scores.ties++;
        if (statusEl) statusEl.textContent = "It's a Draw! (تعادل)";
        playNote(300, 0.25, 'sawtooth');
      } else {
        if (result.winner === 'X') {
          scores.x++;
          if (statusEl) statusEl.textContent = 'Victory for Player X! (فوز مستحق)';
          playNote(659, 0.35, 'sine');
        } else {
          scores.o++;
          if (statusEl) statusEl.textContent = gameMode === 'ai' ? 'AI Wins this round!' : 'Player O Wins!';
          playNote(330, 0.35, 'sine');
        }
        // Highlight winning cells
        if (result.combo) {
          result.combo.forEach((cIdx) => {
            cells[cIdx]?.classList.add('cell-winning');
          });
        }
      }
      updateScoreboard();
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      if (statusEl) {
        statusEl.textContent =
          gameMode === 'ai'
            ? currentPlayer === 'X' ? 'Your Turn (X)' : 'AI Move (O)...'
            : `Player ${currentPlayer}'s Turn`;
      }
    }
  }

  function aiMove() {
    const emptyIndices = board
      .map((val, i) => (val === null ? i : null))
      .filter((val) => val !== null);

    if (emptyIndices.length === 0 || isGameOver) return;

    let chosenIndex = null;

    // 1. Can AI win immediately?
    for (let idx of emptyIndices) {
      const copy = [...board];
      copy[idx] = 'O';
      if (checkWinner(copy)?.winner === 'O') {
        chosenIndex = idx;
        break;
      }
    }

    // 2. Can Player win immediately? Block it!
    if (chosenIndex === null) {
      for (let idx of emptyIndices) {
        const copy = [...board];
        copy[idx] = 'X';
        if (checkWinner(copy)?.winner === 'X') {
          chosenIndex = idx;
          break;
        }
      }
    }

    // 3. Take center if available
    if (chosenIndex === null && board[4] === null && Math.random() < 0.8) {
      chosenIndex = 4;
    }

    // 4. Otherwise pick random open cell
    if (chosenIndex === null) {
      chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    makeMove(chosenIndex, 'O');
  }

  function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    isGameOver = false;
    renderBoard();
    if (statusEl) {
      statusEl.textContent = gameMode === 'ai' ? 'Your Turn (X) - Tap any cell' : 'Player X Starts';
    }
    playNote(520, 0.08, 'sine');
  }

  // Event Listeners
  cells.forEach((cell) => cell.addEventListener('click', handleCellClick));

  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }

  if (modeAiBtn) {
    modeAiBtn.addEventListener('click', () => {
      gameMode = 'ai';
      modeAiBtn.classList.add('active');
      modePvpBtn?.classList.remove('active');
      resetGame();
    });
  }

  if (modePvpBtn) {
    modePvpBtn.addEventListener('click', () => {
      gameMode = '2p';
      modePvpBtn.classList.add('active');
      modeAiBtn?.classList.remove('active');
      resetGame();
    });
  }

  // Initial State
  updateScoreboard();
  resetGame();
}
