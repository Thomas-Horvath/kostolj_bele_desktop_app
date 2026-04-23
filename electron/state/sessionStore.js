import Store from "electron-store";

// A desktop app auth modelljet tudatosan egyszerusitjuk:
// nem webes sessionben es nem cookieban gondolkodunk, hanem egy helyi,
// alkalmazasszintu "utolso bejelentkezett user" allapotban.
//
// Ennek a fajlnak a feladata:
// - a futas kozbeni aktualis user allapot tarolasa memoriaban
// - az utolso bejelentkezett user egyszeru perzisztalasa a gepen
// - az app ujrainditasakor a user visszatoltese

let currentUser = null;
let isHydratedFromDisk = false;
let storeInstance = null;

function getStore() {
  if (!storeInstance) {
    storeInstance = new Store({
      name: "desktop-session",
      clearInvalidConfig: true,
      defaults: {
        lastUser: null,
      },
    });
  }

  return storeInstance;
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id ?? null,
    username: user.username ?? null,
    name: user.name ?? user.username ?? null,
    email: user.email ?? null,
    role: user.role ?? "USER",
  };
}

function hydrateFromDisk() {
  if (isHydratedFromDisk) {
    return;
  }

  currentUser = normalizeUser(getStore().get("lastUser"));
  isHydratedFromDisk = true;
}

export function getCurrentUser() {
  // Elso olvasaskor betoltjuk a gepen tarolt utolso usert.
  // Ettol lesz lehetseges a "mindig azzal induljon az app, aki utoljara be volt lepve"
  // desktop viselkedes.
  hydrateFromDisk();
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = normalizeUser(user);
  isHydratedFromDisk = true;
  getStore().set("lastUser", currentUser);

  return currentUser;
}

export function clearCurrentUser() {
  currentUser = null;
  isHydratedFromDisk = true;
  getStore().set("lastUser", null);
}

export function isAuthenticated() {
  return Boolean(getCurrentUser()?.id);
}
