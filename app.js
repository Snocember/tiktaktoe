// Get DOM elements
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const languageToggle = document.getElementById('language-toggle');
const board = document.getElementById('board');
const modeSelect = document.getElementById('mode-select');
const modeLabel = document.querySelector('label[for="mode-select"]');

const translations = {
  de: {
    turn: (player) => `Spieler ${player} ist am Zug`,
    win: (player) => `Spieler ${player} hat gewonnen!`,
    draw: 'Unentschieden!',
    newGame: 'Neues Spiel',
    board: 'Tic-Tac-Toe Spielfeld',
    cell: (number) => `Feld ${number}`,
    switchLanguage: 'English',
    switchLanguageLabel: 'Switch language to English',
    aiThinking: 'KI überlegt...',
    mode: 'Modus:',
    minimaxMode: '1 Spieler vs KI (Schwer)',
    easyMode: '1 Spieler vs KI (Einfach)',
    localMode: '2 Spieler (Lokal)',
  },
  en: {
    turn: (player) => `Player ${player}'s turn`,
    win: (player) => `Player ${player} wins!`,
    draw: "It's a draw!",
    newGame: 'New Game',
    board: 'Tic-Tac-Toe board',
    cell: (number) => `Cell ${number}`,
    switchLanguage: 'Deutsch',
    switchLanguageLabel: 'Sprache auf Deutsch umstellen',
    aiThinking: 'AI is thinking...',
    mode: 'Mode:',
    minimaxMode: '1 Player vs AI (Hard)',
    easyMode: '1 Player vs AI (Easy)',
    localMode: '2 Players (Local)',
  },
};

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let boardState = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let currentLanguage = 'de';
let isSinglePlayer = true;
let isMinimaxMode = true;
let aiTimeout;

const scores = { O: 10, X: -10, tie: 0 };

function checkWinner(boardArray) {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (boardArray[a] && boardArray[a] === boardArray[b] && boardArray[a] === boardArray[c]) {
      return boardArray[a]; // Gibt 'X' oder 'O' zurück
    }
  }
  if (!boardArray.includes('')) return 'tie';
  return null;
}

function minimax(boardArray, depth, isMaximizing) {
  let result = checkWinner(boardArray);
  if (result !== null) {
    if (result === 'tie') return scores.tie;
    return result === 'O' ? scores.O - depth : scores.X + depth;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardArray[i] === '') {
        boardArray[i] = 'O';
        let score = minimax(boardArray, depth + 1, false);
        boardArray[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardArray[i] === '') {
        boardArray[i] = 'X';
        let score = minimax(boardArray, depth + 1, true);
        boardArray[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (boardState[i] === '') {
      boardState[i] = 'O';
      let score = minimax(boardState, 0, false);
      boardState[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function getRandomMove() {
  const availableMoves = boardState
    .map((value, index) => (value === '' ? index : null))
    .filter((index) => index !== null);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}



function executeMove(index) {
  boardState[index] = currentPlayer;
  cells[index].textContent = currentPlayer;
  cells[index].dataset.player = currentPlayer;

  const winningLine = getWinningLine();
  if (winningLine) {
    gameActive = false;
    updateStatus();
    highlightWinningCells(winningLine);
    board.removeAttribute('data-turn');
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    return;
  }

  if (!boardState.includes('')) {
    gameActive = false;
    updateStatus();
    board.removeAttribute('data-turn');
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
  board.dataset.turn = currentPlayer;
}

function handleCellClick(event) {
  const cell = event.target;
  const index = Number(cell.dataset.index);

  if (boardState[index] !== '' || !gameActive || (isSinglePlayer && currentPlayer === 'O')) {
    return;
  }


  executeMove(index);


  if (gameActive && isSinglePlayer && currentPlayer === 'O') {
    const text = translations[currentLanguage];
    statusText.textContent = text.aiThinking;
    board.removeAttribute('data-turn');
    
    aiTimeout = setTimeout(() => {
      if (!gameActive || currentPlayer !== 'O' || !isSinglePlayer) return;
      const aiMove = isMinimaxMode ? getBestMove() : getRandomMove();
      executeMove(aiMove);
    }, 400);
  }
}

function updateStatus() {
  const text = translations[currentLanguage];
  const winningLine = getWinningLine();

  if (winningLine) {
    statusText.textContent = text.win(boardState[winningLine[0]]);
  } else if (!boardState.includes('')) {
    statusText.textContent = text.draw;
  } else {
    statusText.textContent = text.turn(currentPlayer);
  }
}

function updateLanguage() {
  const text = translations[currentLanguage];
  document.documentElement.lang = currentLanguage;
  resetBtn.textContent = text.newGame;
  board.setAttribute('aria-label', text.board);
  cells.forEach((cell, index) => {
    cell.setAttribute('aria-label', text.cell(index + 1));
  });
  languageToggle.textContent = text.switchLanguage;
  languageToggle.setAttribute('aria-label', text.switchLanguageLabel);

  if (modeLabel && modeSelect) {
    modeLabel.textContent = text.mode;
    modeSelect.querySelector('[value="single-minimax"]').textContent = text.minimaxMode;
    modeSelect.querySelector('[value="single-easy"]').textContent = text.easyMode;
    modeSelect.querySelector('[value="multi"]').textContent = text.localMode;
  }

  if (gameActive && isSinglePlayer && currentPlayer === 'O') {
    statusText.textContent = text.aiThinking;
  } else {
    updateStatus();
  }
}

function toggleLanguage() {
  currentLanguage = currentLanguage === 'de' ? 'en' : 'de';
  updateLanguage();
}


function getWinningLine() {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (
      boardState[a] !== '' &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      return combination;
    }
  }
  return null;
}


function highlightWinningCells(indices) {
  indices.forEach((index) => {
    cells[index].classList.add('win');
  });
}

function resetGame() {
  clearTimeout(aiTimeout);
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  board.dataset.turn = 'X';

  cells.forEach((cell) => {
    cell.textContent = '';
    delete cell.dataset.player;
    cell.classList.remove('win');
  });
  
  updateStatus();
}


if (modeSelect) {
  modeSelect.addEventListener('change', (e) => {
    isSinglePlayer = e.target.value !== 'multi';
    isMinimaxMode = e.target.value === 'single-minimax';
    resetGame();
  });
}

cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
if (languageToggle) languageToggle.addEventListener('click', toggleLanguage);

updateLanguage();