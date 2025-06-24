// Startet direkt die Login-Ansicht und bindet das CSS ein
import { LoginView } from "./views/LoginView.js";
import { LobbyView } from "./views/LobbyView";
import { GameView } from "./views/GameView.js";
import { registerRoute } from "./router.js";
import "./app.css";

registerRoute("/", LoginView);
registerRoute("#/lobby", LobbyView);
registerRoute("#/game", GameView);
