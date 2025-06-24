// Erstellt ein 6x7 Spielbrett und zeigt es im DOM an
export function createBoard() {
  const rows = 6;
  const cols = 7;
  const board = Array.from({ length: rows }, () => Array(cols).fill(" "));

  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = document.createElement("div");
      tile.id = `${r}-${c}`;
      tile.className = "tile";
      boardDiv.appendChild(tile);
    }
  }

  return board;
}

// Aktualisiert das Spielfeld im DOM je nach Spielstatus
export function updateBoardUI(board) {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const tile = document.getElementById(`${r}-${c}`);
      tile.className = "tile";
      if (board[r][c] === "R") tile.classList.add("red");
      if (board[r][c] === "Y") tile.classList.add("yellow");
    }
  }
}

// Prüft, ob ein Spieler 4 in eine Richtung geschafft hat
export function checkWin(board, row, col, player) {
  const directions = [
    [1, 0], // Vertikal
    [0, 1], // Horizontal
    [1, 1], // Diagonal ↘
    [1, -1], // Diagonal ↙
  ];

  for (let [dx, dy] of directions) {
    let count = 1;
    count += countDirection(board, row, col, dx, dy, player);
    count += countDirection(board, row, col, -dx, -dy, player);
    if (count >= 4) return true;
  }
  return false;
}

// Zählt gleichfarbige Steine in einer Richtung
function countDirection(board, row, col, dx, dy, player) {
  let count = 0;
  for (let i = 1; i < 4; i++) {
    const r = row + dx * i;
    const c = col + dy * i;
    if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) break;
    if (board[r][c] !== player) break;
    count++;
  }
  return count;
}
