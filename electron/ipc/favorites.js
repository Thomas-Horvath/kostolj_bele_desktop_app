import { getCurrentUser } from "../state/sessionStore.js";
import {
  listFavoriteRecipeIds,
  toggleFavoriteRecipe,
} from "../../lib/services/favoriteService.js";

export function registerFavoriteIpc(ipcMain) {
  ipcMain.handle("favorites:list", async () => {
    // Kedvencek adatfolyam röviden:
    // renderer -> favoritesClient -> preload -> ipc/favorites -> favoriteService -> Prisma
    //
    // Fontos, hogy itt még nem a renderer mondja meg, ki az aktuális user,
    // hanem a desktop sessionStore-ból olvassuk ki. Így nem lehet a UI-ból
    // "másik userhez" kérni kedvenceket.
    return listFavoriteRecipeIds(getCurrentUser());
  });

  ipcMain.handle("favorites:toggle", async (_event, recipeId) => {
    // A toggle service dönti el, hogy a kedvenc már létezik-e:
    // - ha igen, törli
    // - ha nem, létrehozza
    //
    // A renderer ebből csak a végeredményt kapja vissza: favorited true/false.
    return toggleFavoriteRecipe(recipeId, getCurrentUser());
  });
}
