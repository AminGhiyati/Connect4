const routes = new Map();

export function registerRoute(path, viewFunc) {
  routes.set(path, viewFunc);
}

export function navigateTo(viewFunc, path = null) {
  renderView(viewFunc);
  if (path) {
    history.pushState(null, "", path);
  }
}

function renderView(viewFunc) {
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = "";
    viewFunc();
  }
}

function handleRoute() {
  const hash = location.hash.slice(1);
  const parts = hash.split("/");

  if (parts[0] === "game" && parts[1]) {
    const roomNumber = parseInt(parts[1]);
    const viewFunc = routes.get("/game");
    if (viewFunc) renderView(() => viewFunc(roomNumber));
    return;
  }

  const viewFunc = routes.get("/" + (parts[0] || ""));
  if (viewFunc) {
    renderView(viewFunc);
  }
}


window.addEventListener("popstate", handleRoute);
window.addEventListener("hashchange", handleRoute);
document.addEventListener("DOMContentLoaded", handleRoute);
