import { getDesktopApi } from "./getDesktopApi";

const favoritesClient = {
  list() {
    return getDesktopApi().favorites.list();
  },
  toggle(recipeId) {
    return getDesktopApi().favorites.toggle(recipeId);
  },
};

export default favoritesClient;

