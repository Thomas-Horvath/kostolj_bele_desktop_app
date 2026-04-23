import { getCurrentUser } from "../state/sessionStore.js";
import {
  listFavoriteRecipeIds,
  toggleFavoriteRecipe,
} from "../../lib/services/favoriteService.js";

export function registerFavoriteIpc(ipcMain) {
  ipcMain.handle("favorites:list", async () => {
    // Kedvencek adatfolyam:
    // renderer -> favoritesClient -> preload -> ipc/favorites -> favoriteService
    return listFavoriteRecipeIds(getCurrentUser());
  });

  ipcMain.handle("favorites:toggle", async (_event, recipeId) => {
    // A toggle service donti el, hogy a kedvenc mar letezik-e.
    // Ha igen torli, ha nem letrehozza.
    return toggleFavoriteRecipe(recipeId, getCurrentUser());
  });
}
