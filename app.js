// DOM-Elemente referenzieren
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

// Alle 8 Gewinnlinien (3 Reihen, 3 Spalten, 2 Diagonalen)
const WINNING_COMBINATIONS = [
  [0, 1, 2], // Oben waagerecht
  [3, 4, 5], // Mitte waagerecht
  [6, 7, 8], // Unten waagerecht
  [0, 3, 6], // Links senkrecht
  [1, 4, 7], // Mitte senkrecht
  [2, 5, 8], // Rechts senkrecht
  [0, 4, 8], // Diagonale links oben nach rechts unten
  [2, 4, 6], // Diagonale rechts oben nach links unten
];

// Spielzustand (State)
let boardState = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;

// Klick auf ein Feld verarbeiten
function handleCellClick(event) {
  const cell = event.target;
  const index = Number(cell.dataset.index);

  // Abbrechen, wenn Feld belegt oder Spiel bereits beendet ist
  if (boardState[index] !== '' || !gameActive) {
    return;
  }

  // Zug speichern und im UI anzeigen
  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.dataset.player = currentPlayer;

  // Prüfen, ob der aktuelle Zug zum Sieg führt
  const winningLine = getWinningLine();
  if (winningLine) {
    gameActive = false;
    statusText.textContent = `Spieler ${currentPlayer} hat gewonnen!`;
    highlightWinningCells(winningLine);
    return;
  }

  // Prüfen, ob alle 9 Felder voll sind (Unentschieden)
  if (!boardState.includes('')) {
    gameActive = false;
    statusText.textContent = 'Unentschieden!';
    return;
  }

  // Spieler wechseln
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = `Spieler ${currentPlayer} ist am Zug`;
}

// Prüft alle 8 Linien und gibt bei einem Treffer die 3 Gewinn-Indizes zurück
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

// Gewinnlinie optisch hervorheben
function highlightWinningCells(indices) {
  indices.forEach((index) => {
    cells[index].classList.add('win');
  });
}

// Spiel komplett zurücksetzen (Issue #8)
function resetGame() {
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  statusText.textContent = 'Spieler X ist am Zug';

  cells.forEach((cell) => {
    cell.textContent = '';
    delete cell.dataset.player;
    cell.classList.remove('win');
  });
}

// Event-Listener registrieren
cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);