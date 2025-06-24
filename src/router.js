// Navigiert zur gegebenen View (löscht vorherigen Inhalt)
export function navigateTo(view) {
  document.getElementById("app").innerHTML = "";
  view();
}
