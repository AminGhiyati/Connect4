import { Server } from "socket.io";

const io = new Server(3001, {
  cors: { origin: "*" },
});

const rooms = new Map(); 
const roomStates = new Map();

io.on("connection", (socket) => {
  console.log("Ein Client hat sich verbunden:", socket.id);

  socket.on("set-username", (username) => {
    socket.username = username;
  });

  socket.on("join-room", (username, roomName) => {
    socket.username = username;

    if (!rooms.has(roomName)) {
      rooms.set(roomName, []);
    }

    const room = rooms.get(roomName);

    if (room.length >= 2) {
      socket.emit("error", "Raum ist voll.");
      return;
    }

    socket.room = roomName;
    room.push(socket);

    if (room.length === 2) {
      room.forEach((s, idx) => {
        s.playerColor = idx === 0 ? "R" : "Y";
        s.emit("start", idx);
      });

      roomStates.set(roomName, { currentTurn: 0 });

      room.forEach((s, idx) => {
        s.emit("turn", idx === 0);
      });
    }
  });

  socket.on("move", (col) => {
    const roomName = socket.room;
    const room = rooms.get(roomName);
    const state = roomStates.get(roomName);

    if (!room || !state) return;

    const playerIdx = room.indexOf(socket);
    if (playerIdx !== state.currentTurn) return;

    const player = socket.playerColor;

    room.forEach((s) => {
      s.emit("move", { col, player });
    });

    state.currentTurn = (state.currentTurn + 1) % 2;
    room.forEach((s, idx) => {
      s.emit("turn", idx === state.currentTurn);
    });
  });

  socket.on("chat", (message) => {
    const roomName = socket.room;
    const room = rooms.get(roomName);
    if (!room || !socket.username) return;

    const msg = {
      username: socket.username,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };

    room.forEach((s) => s.emit("chat", msg));
  });

  socket.on("lobby-chat", (message) => {
    const msg = {
      username: socket.username,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    io.emit("lobby-chat", msg);
  });

  socket.on("leave-room", (roomName) => {
    if (!roomName || !rooms.has(roomName)) return;

    const room = rooms.get(roomName);
    const newRoom = room.filter((s) => s !== socket);

    if (newRoom.length === 0) {
      rooms.delete(roomName);
      roomStates.delete(roomName);
    } else {
      rooms.set(roomName, newRoom);
    }

    socket.leave(roomName);
  });
});
