// DOM-Elemente referenzieren
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

// Spielzustand (State) - Issue #6
let boardState = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;

// Klick auf ein Feld verarbeiten
function handleCellClick(event) {
  const cell = event.target;
  const index = Number(cell.dataset.index);

  // Abbrechen, wenn Feld belegt oder Spiel beendet ist
  if (boardState[index] !== '' || !gameActive) {
    return;
  }

  // Zug speichern und im UI anzeigen
  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.dataset.player = currentPlayer;

  // TODO (Issue #7): Hier Gewinn- und Unentschieden-Prüfung aufrufen

  // Spieler wechseln
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = `Spieler ${currentPlayer} ist am Zug`;
}

// Spiel zurücksetzen - TODO (Issue #8)
function resetGame() {
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  statusText.textContent = 'Spieler X ist am Zug';

  cells.forEach((cell) => {
    cell.textContent = '';
    delete cell.dataset.player;
  });
}

// Event-Listener registrieren
cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);