import { setupDragAndDrop } from "../components/DragDrop.js";
import { createBoard, updateBoardUI, checkWin } from "../components/Board.js";
import { io } from "socket.io-client";
import { navigateTo } from "../router.js";
import { LobbyView } from "./LobbyView.js";

// WebSocket-Verbindung zum Server aufbauen
export const socket = io("http://localhost:3001");

// Hauptansicht für das Spiel
export function GameView(roomNumber) {
  const app = document.getElementById("app");
  const room = `room${roomNumber}`

  // HTML-Gerüst für Spielfeld und Chatbereich
  app.innerHTML = `
    <div class="game-container">
      <p>Raum${roomNumber}</p>
      <div class="game-area">
        <div id="turnInfo"></div>
        <div id="dropzoneRow"></div>
        <div id="board"></div>
      </div>
      <div class="chat-area">
        <div id="chatMessages"></div>
        <div class="chat-input-container">
          <input type="text" id="chatInput" placeholder="Nachricht eingeben...">
          <button id="sendButton">Senden</button>
        </div>
      </div>
    </div>
    <button id="zurück">Home</button>
  `;


  // Spielfeld-Logik initialisieren
  const board = createBoard();
  let currentPlayer = "R";
  let myColor = null;
  let myTurn = false;
  let gameOver = false;
  let initialized = false;

  const username = localStorage.getItem("username");
  socket.emit("join-room", username, room);

  document.getElementById("zurück").addEventListener("click", () => {
    socket.emit("leave-room", room); //socket.disconnect();
    navigateTo(() => LobbyView(), "#/lobby");
  });


  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendButton = document.getElementById("sendButton");

  // Neue Chatnachricht ins UI einfügen
  function addChatMessage(data) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";
    messageDiv.innerHTML = `
      <span class="chat-username">${data.username}:</span>
      <span class="chat-text">${data.message}</span>
      <span class="chat-time">${data.timestamp}</span>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Empfangene Chatnachricht anzeigen
  socket.on("chat", (data) => {
    addChatMessage(data);
  });

  // Nachricht senden per Button oder Enter-Taste
  sendButton.addEventListener("click", () => {
    const message = chatInput.value.trim();
    if (message) {
      socket.emit("chat", message);
      chatInput.value = "";
    }
  });
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const message = chatInput.value.trim();
      if (message) {
        socket.emit("chat", message);
        chatInput.value = "";
      }
    }
  });

  // Server meldet Spielstart + eigene Farbe
  socket.on("start", (playerIndex) => {
    currentPlayer = playerIndex === 0 ? "R" : "Y";
    myColor = currentPlayer;
    initialized = true;

    addChatMessage({
      username: "System",
      message: `Spiel gestartet! Du bist ${myColor === "R" ? "Rot" : "Gelb"}.`,
      timestamp: new Date().toLocaleTimeString(),
    });
  });

  // Server teilt mit, wer dran ist
  socket.on("turn", (isMyTurn) => {
    myTurn = isMyTurn;
    const turnInfo = document.getElementById("turnInfo");
    turnInfo.textContent = myTurn
      ? "Du bist am Zug!"
      : "Warte auf den Gegner...";
  });

  // Bewegung vom Server empfangen und Spielfeld aktualisieren
  socket.on("move", ({ col, player }) => {
    if (gameOver || !initialized) return;

    const row = dropToColumn(board, col, player);
    updateBoardUI(board);
    if (row === -1) return;

    // Gewinn prüfen
    if (checkWin(board, row, col, player)) {
      gameOver = true;

      const isWinner = player === myColor;
      if (isWinner) playWinSound();

      const turnInfo = document.getElementById("turnInfo") || document.createElement("div");
      turnInfo.id = "turnInfo";
      const appEl = document.getElementById("app");
      if (appEl && !document.getElementById("turnInfo"))
        appEl.prepend(turnInfo);

      const msg =
        player === myColor
          ? `Du hast gewonnen! (${player === "R" ? "Rot" : "Gelb"})`
          : `Du hast verloren! (${player === "R" ? "Rot" : "Gelb"} gewinnt)`;

      turnInfo.textContent = msg;
      addChatMessage({
        username: "System",
        message: msg,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Anzeigetext für Gewinn und Debugg
      if (appEl) {
        const debugDiv = document.createElement("div");
        debugDiv.style.background = "#fff";
        debugDiv.style.color = "#d00";
        debugDiv.style.fontWeight = "bold";
        debugDiv.style.fontSize = "2em";
        debugDiv.textContent = msg;
        appEl.prepend(debugDiv);
      }
      return;
    }

    // Unentschieden prüfen
    if (isBoardFull(board)) {
      gameOver = true;
      const msg = "Unentschieden! Kein Spieler hat gewonnen.";
      document.getElementById("turnInfo").textContent = msg;
      addChatMessage({
        username: "System",
        message: msg,
        timestamp: new Date().toLocaleTimeString(),
      });

      const appEl = document.getElementById("app");
      if (appEl) {
        const debugDiv = document.createElement("div");
        debugDiv.style.background = "#fff";
        debugDiv.style.color = "#333";
        debugDiv.style.fontWeight = "bold";
        debugDiv.style.fontSize = "2em";
        debugDiv.textContent = msg;
        appEl.prepend(debugDiv);
      }
    }
  });

  // Wenn Spieler Drop ausführt
  function handleDrop(col) {
    if (!myTurn || gameOver || !initialized) return;
    socket.emit("move", col);
  }

  // Initialisiere Drag & Drop mit Callback
  setupDragAndDrop(handleDrop);
}

// Füge Spielstein in Spalte ein, falls möglich
function dropToColumn(board, col, player) {
  for (let r = board.length - 1; r >= 0; r--) {
    if (board[r][col] === " ") {
      board[r][col] = player;
      return r;
    }
  }
  return -1;
}

// Liefert die gegnerische Farbe
function getOpponent(player) {
  return player === "R" ? "Y" : "R";
}

// Spielsound abspielen bei Gewinn
function playWinSound() {
  const audio = new Audio("/sounds/W.mp3");
  audio.play();
}

// Prüft, ob das gesamte Spielfeld voll ist
function isBoardFull(board) {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (board[r][c] === " ") return false;
    }
  }
  return true;
}