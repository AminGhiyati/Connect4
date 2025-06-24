import { Server } from "socket.io";

// Initialisiere den WebSocket-Server auf Port 3001
const io = new Server(3001, {
  cors: { origin: "*" }, // Erlaube alle Cross-Origin-Verbindungen
});

// Liste aller Spielräume
const rooms = [];
// Merkt sich den Zustand je Raum
const roomStates = new Map();

// Wenn ein Client sich verbindet
io.on("connection", (socket) => {
  // Spieler tritt einem Raum bei
  socket.on("join", (username) => {
    // Finde einen Raum mit weniger als 2 Spielern
    let room = rooms.find((r) => r.length < 2);
    if (!room) {
      room = [];
      rooms.push(room);
    }

    // Vermeide doppelte Nutzernamen
    const existingUsernames = room.map((s) => s.username);
    let finalUsername = username;
    let counter = 1;
    while (existingUsernames.includes(finalUsername)) {
      finalUsername = `${username}${counter}`;
      counter++;
    }

    // Socket-Infos setzen
    room.push(socket);
    socket.username = finalUsername;
    socket.room = room;

    // Wenn zwei Spieler im Raum sind: Spiel starten
    if (room.length === 2) {
      room.forEach((s, idx) => {
        s.playerColor = idx === 0 ? "R" : "Y"; // Spielerfarbe zuweisen
        s.emit("start", idx); // Sende Startsignal an beide
      });
      roomStates.set(room, { currentTurn: 0 });

      // Spieler 1 ist am Zug
      room.forEach((s, idx) => {
        s.emit("turn", idx === 0);
      });
    }
  });

  // Wenn ein Spieler einen Zug macht
  socket.on("move", (col) => {
    const player = socket.playerColor;
    const room = socket.room;
    const state = roomStates.get(room);
    const playerIdx = room.indexOf(socket);

    // Nur verarbeiten, wenn der Spieler dran ist
    if (state && playerIdx === state.currentTurn) {
      room.forEach((s) => {
        s.emit("move", { col, player });
      });

      // Zug an nächsten Spieler weitergeben
      state.currentTurn = (state.currentTurn + 1) % 2;
      room.forEach((s, idx) => {
        s.emit("turn", idx === state.currentTurn);
      });
    }
  });

  // Chat-Nachricht an Raum senden
  socket.on("chat", (message) => {
    const room = socket.room;
    if (room && socket.username) {
      room.forEach((s) => {
        s.emit("chat", {
          username: socket.username,
          message: message,
          timestamp: new Date().toLocaleTimeString(),
        });
      });
    }
  });
});
