import { navigateTo } from "../router.js";
import { LobbyView } from "./LobbyView.js";

// Zeigt das Loginformular und verarbeitet die Eingabe
export function LoginView() {
  const app = document.getElementById("app");
  const form = document.createElement("form");

  // HTML-Formularstruktur
  form.innerHTML = `
    <div id="anmelden">
      <input type="text" required placeholder="Dein Name">
      <button id="button" type="submit">Loslegen</button>
    </div>
  `;

  // Beim Absenden des Formulars:
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = form.querySelector("input").value;
    // Benutzernamen lokal speichern (für später im Spiel)
    localStorage.setItem("username", username);

    navigateTo(LobbyView, "#/lobby");
  });

  // Formular ins DOM einfügen
  app.appendChild(form);
}
