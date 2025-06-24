import { navigateTo } from "../router.js";
import fallbackJokes from "../fallbackJokes.js";
import { GameView } from "./GameView.js";

// Zeigt das Loginformular mit Witz und verarbeitet die Eingabe
export function LoginView() {
  const app = document.getElementById("app");
  const form = document.createElement("form");

  // HTML-Formularstruktur
  form.innerHTML = `
    <input type="text" required placeholder="Dein Name">
    <button type="submit">Loslegen</button>
    <div id="jokeDisplay"></div>
  `;

  // Beim Absenden des Formulars:
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = form.querySelector("input").value;
    let joke;

    // Versuche einen Witz von der API zu holen
    try {
      const res = await fetch("https://v2.jokeapi.dev/joke/Any?type=single");
      const data = await res.json();
      joke = data.joke;
    } catch {
      // Falls Fehler: Fallback-Witz
      joke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    }

    // Witz anzeigen
    document.getElementById("jokeDisplay").textContent = joke;

    // Benutzernamen lokal speichern (für später im Spiel)
    localStorage.setItem("username", username);

    // Nach 3 Sekunden zur Spielansicht wechseln
    setTimeout(() => navigateTo(GameView), 3000);
  });

  // Formular ins DOM einfügen
  app.appendChild(form);
}
