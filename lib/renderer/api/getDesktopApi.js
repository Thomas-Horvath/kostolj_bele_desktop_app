// A rendererben nem akarunk szanaszet szort `window.appApi` hivasokat.
// Ez a helper egy helyen ellenorzi, hogy tenyleg Electron kornyezetben
// futunk-e, es ertelmes hibaval all meg, ha valaki webes futasban probalja
// hasznalni a desktop-only API-t.
//
// Ez azert hasznos, mert a kovetkezo refaktor korokben egyszerre lesz jelen:
// - a regi webes kod
// - az uj desktopos kod
// Ilyenkor sokat segit, ha az Electron-fuggo reszeket egyetlen ponton lehet
// ellenorizni es hibaztatni.

export function getDesktopApi() {
  if (typeof window === "undefined") {
    throw new Error(
      "A desktop API csak bongeszo/renderer kornyezetben erheto el."
    );
  }

  if (!window.appApi) {
    throw new Error(
      "A window.appApi meg nincs jelen. Ellenorizd, hogy Electron preloadbol fut-e az alkalmazas."
    );
  }

  return window.appApi;
}
