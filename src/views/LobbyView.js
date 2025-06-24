import { navigateTo } from "../router.js";
import fallbackJokes from "../fallbackJokes.js";
import { GameView } from "./GameView.js";
import { socket } from "./GameView.js";

export function LobbyView() {
    const username = localStorage.getItem("username") || "Gast";
    socket.emit("set-username", username); // Username sofort senden

    const app = document.getElementById("app");
    app.innerHTML = `
    <div id="lobbydiv">
        <h1>Lobby</h1>
        <div id="jokeDisplay">h</div>
        <div id="roombuttons">
        <button id="room1">Raum 1</button>
        <button id="room2">Raum 2</button>
        <button id="room3">Raum 3</button>
        <button id="room4">Raum 4</button>
        </div>

        <div id="ripImageContainer">
            <img src="https://images.thalia.media/-/BF2000-2000/88c4c51c8e7140eaab888bea94458d05/hasbro-4-gewinnt-das-original.jpeg" alt="RIP" />
        </div>

        <div class="chat-area">
        <div id="chatMessages"></div>
        <div class="chat-input-container">
          <input type="text" id="chatInput" placeholder="Nachricht eingeben...">
          <button id="sendButton">Senden</button>
        </div>
        </div>
        </div>
    </div>
    `;

    document.getElementById("room1").addEventListener("click", () => navigateTo(() => GameView(1), "#/game/1"));
    document.getElementById("room2").addEventListener("click", () => navigateTo(() => GameView(2), "#/game/2"));
    document.getElementById("room3").addEventListener("click", () => navigateTo(() => GameView(3), "#/game/3"));
    document.getElementById("room4").addEventListener("click", () => navigateTo(() => GameView(4), "#/game/4"));

    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const sendButton = document.getElementById("sendButton");

    // Neue Nachricht ans UI anhängen
    function addLobbyChatMessage(data) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "chat-message";
        messageDiv.innerHTML = `
      <span class="chat-username"><strong>${data.username}:</strong></span>
      <span class="chat-text"> ${data.message}</span>
      <span class="chat-time" style="float: right;">${data.timestamp}</span>
    `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Empfangene Nachrichten anzeigen
    socket.on("lobby-chat", (data) => {
        addLobbyChatMessage(data);
    });

    // Senden mit Button oder Enter
    function sendLobbyMessage() {
        const message = chatInput.value.trim();
        if (message) {
            socket.emit("lobby-chat", message);
            chatInput.value = "";
        }
    }

    sendButton.addEventListener("click", sendLobbyMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendLobbyMessage();
    });


    async function Joker() {
        let joke;
        try {
            const res = await fetch("https://v2.jokeapi.dev/joke/Any?type=single");
            const data = await res.json();
            joke = data.joke;
        } catch {
            joke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        }

        document.getElementById("jokeDisplay").textContent = joke;
    }
    Joker();

}