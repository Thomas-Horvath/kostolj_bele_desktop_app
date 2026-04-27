"use client";

import { useEffect, useSyncExternalStore } from "react";
import favoritesClient from "../../lib/renderer/api/favoritesClient";
import { useDesktopAuth } from "./DesktopAuthContext";

/*
  FONTOS MENTÁLIS MODELL EHHEZ A FÁJLHOZ

  A kedvencek állapotát nem sima React useState-ben tartjuk egy Provider value-ban,
  mert akkor minden változás végig tudna hullámozni az egész Provider subtree-n.

  Ehelyett itt egy pici "külső store" van:
  - a store modulszinten él
  - a FavoriteButton csak a saját recipeId-jéhez tartozó szeletet figyeli
  - a figyeléshez useSyncExternalStore-t használunk

  Ennek az előnye:
  - egy szív ikon kattintása nem rántja újra a sidebar / lista / header részeket
  - csak az a FavoriteButton frissül, amelyiknek ténylegesen változott az állapota
*/
function createFavoriteStore() {
  // Mindig az aktuális desktop user kedvenceit tartjuk memóriában.
  // Ha usert váltunk vagy kijelentkezünk, ezt a memóriát tudatosan ürítjük.
  let currentUserId = null;
  let favoriteIds = new Set();
  let pendingIds = new Set();
  const listeners = new Set();

  function emitChange() {
    listeners.forEach((listener) => listener());
  }

  function normalizeRecipeId(recipeId) {
    // A UI-ból néha stringként, néha numberként jöhet receptazonosító.
    // A store belső működéséhez egységesen számmá normalizáljuk.
    const normalizedId = Number(recipeId);
    return Number.isFinite(normalizedId) ? normalizedId : null;
  }

  function setCurrentUserId(nextUserId) {
    if (currentUserId === nextUserId) {
      return;
    }

    currentUserId = nextUserId;
    favoriteIds = new Set();
    pendingIds = new Set();
    emitChange();
  }

  async function hydrateForUser(nextUserId) {
    // Ez a "kezdeti szinkronizálás":
    // amikor tudjuk, hogy ki az aktuális user, lehúzzuk hozzá a kedvenc recipe ID-ket.
    if (!nextUserId) {
      setCurrentUserId(null);
      return;
    }

    currentUserId = nextUserId;

    try {
      const data = await favoritesClient.list();
      favoriteIds = new Set(Array.isArray(data) ? data.map(Number) : []);
      pendingIds = new Set();
      emitChange();
    } catch (error) {
      console.error("Nem sikerült betölteni a kedvenceket.", error);
      favoriteIds = new Set();
      pendingIds = new Set();
      emitChange();
    }
  }

  async function toggle(recipeId) {
    const normalizedId = normalizeRecipeId(recipeId);

    // Három esetben nem csinálunk semmit:
    // 1. hibás recipeId jött
    // 2. nincs aktuális user
    // 3. ugyanarra a gombra már folyamatban van egy kérés
    if (normalizedId === null || !currentUserId || pendingIds.has(normalizedId)) {
      return;
    }

    // A pending állapotot külön tároljuk recipeId-nként.
    // Ettől lehet az, hogy csak az adott gomb tiltódik le rövid időre.
    pendingIds = new Set(pendingIds).add(normalizedId);
    emitChange();

    try {
      const data = await favoritesClient.toggle(normalizedId);
      const nextFavorites = new Set(favoriteIds);

      // Az IPC válasza csak annyit mond meg, hogy mostantól kedvenc-e.
      // A store ebből helyben kiszámolja az új memóriabeli állapotot.
      if (data.favorited) {
        nextFavorites.add(normalizedId);
      } else {
        nextFavorites.delete(normalizedId);
      }

      favoriteIds = nextFavorites;
    } catch (error) {
      console.error("Hiba a favorite toggle-nál:", error);
    } finally {
      const nextPending = new Set(pendingIds);
      nextPending.delete(normalizedId);
      pendingIds = nextPending;
      emitChange();
    }
  }

  function subscribe(listener) {
    // A useSyncExternalStore ezen keresztül "iratkozik fel" a store-ra.
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function getRecipeState(recipeId) {
    // Egy tömör state kódot adunk vissza:
    // 0 = nem kedvenc, nem pending
    // 1 = kedvenc
    // 2 = pending
    // 3 = kedvenc és pending
    //
    // Ez azért hasznos, mert a useSyncExternalStore snapshotja primitív érték,
    // így könnyű és stabil összehasonlítani.
    const normalizedId = normalizeRecipeId(recipeId);

    if (normalizedId === null) {
      return 0;
    }

    let code = 0;

    if (favoriteIds.has(normalizedId)) {
      code += 1;
    }

    if (pendingIds.has(normalizedId)) {
      code += 2;
    }

    return code;
  }

  return {
    subscribe,
    getRecipeState,
    hydrateForUser,
    setCurrentUserId,
    toggle,
  };
}

const favoriteStore = createFavoriteStore();

export function FavoriteProvider({ children }) {
  const { user } = useDesktopAuth();

  useEffect(() => {
    // A Provider feladata itt már nagyon kicsi:
    // csak összeköti az auth réteget a favorit store-ral.
    //
    // Magyarul:
    // - ha nincs user, ürítjük a store-t
    // - ha van user, betöltjük hozzá a kedvenceket
    if (!user?.id) {
      favoriteStore.setCurrentUserId(null);
      return;
    }

    favoriteStore.hydrateForUser(user.id);
  }, [user?.id]);

  return children;
}

export function useFavorite(recipeId) {
  // Ez a hook pontosan egyetlen recepthez tartozó favorit állapotot figyel.
  // Nem az összes kedvenc listát adjuk vissza, csak a szükséges mini-szeletet.
  const stateCode = useSyncExternalStore(
    favoriteStore.subscribe,
    () => favoriteStore.getRecipeState(recipeId),
    () => 0
  );

  return {
    isFavorite: Boolean(stateCode & 1),
    isPending: Boolean(stateCode & 2),
    // A recipeId-t itt már "bezárjuk" a hookba, így a gombnak csak ennyit kell hívnia:
    // toggleFavorite()
    toggleFavorite: () => favoriteStore.toggle(recipeId),
  };
}
