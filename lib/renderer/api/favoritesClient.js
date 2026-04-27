import { getDesktopApi } from "./getDesktopApi";

const favoritesClient = {
  list() {
    // A renderer itt még semmit nem tud az IPC-ről vagy a Prisma-ról.
    // Csak egy egyszerű kliensfüggvényt hív, mint bármely másik frontend API-nál.
    return getDesktopApi().favorites.list();
  },
  toggle(recipeId) {
    // A toggle művelet csak a recipeId-t küldi át,
    // a usert a main process oldalon a sessionStore határozza meg.
    return getDesktopApi().favorites.toggle(recipeId);
  },
};

export default favoritesClient;
