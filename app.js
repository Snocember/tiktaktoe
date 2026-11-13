// Get DOM elements
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const languageToggle = document.getElementById('language-toggle');
const board = document.getElementById('board');

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
  },
};


const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Game state
let boardState = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let currentLanguage = 'de';

// Handle a cell click
function handleCellClick(event) {
  const cell = event.target;
  const index = Number(cell.dataset.index);

  // Ignore clicks on occupied cells or after the game has ended
  if (boardState[index] !== '' || !gameActive) {
    return;
  }

  // Save the move and update the UI
  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.dataset.player = currentPlayer;

  // Check whether the current move wins the game
  const winningLine = getWinningLine();
  if (winningLine) {
    gameActive = false;
    updateStatus();
    highlightWinningCells(winningLine);
    
    board.removeAttribute('data-turn');
    
    // Celebrate the win
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    return;
  }

  // Check whether all 9 cells are filled (a draw)
  if (!boardState.includes('')) {
    gameActive = false;
    updateStatus();
    board.removeAttribute('data-turn');
    return;
  }

  // Switch players
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
  board.dataset.turn = currentPlayer;
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
  updateStatus();
}

function toggleLanguage() {
  currentLanguage = currentLanguage === 'de' ? 'en' : 'de';
  updateLanguage();
}

// Check all 8 lines and return the 3 winning cell indices, if any
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

// Highlight the winning line
function highlightWinningCells(indices) {
  indices.forEach((index) => {
    cells[index].classList.add('win');
  });
}

// Reset the game (Issue #8)
function resetGame() {
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  board.dataset.turn = 'X';

  cells.forEach((cell) => {
    cell.textContent = '';
    delete cell.dataset.player;
    cell.classList.remove('win');
  });
}

// Register event listeners
cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
languageToggle.addEventListener('click', toggleLanguage);
updateLanguage();