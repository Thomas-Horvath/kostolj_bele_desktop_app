import { getCurrentUser } from "../state/sessionStore.js";
import { saveRecipeRating } from "../../lib/services/ratingService.js";

export function registerRatingIpc(ipcMain) {
  ipcMain.handle("rating:save", async (_event, payload) => {
    // Rating adatfolyam:
    // RateRecipe -> ratingClient -> preload -> ipc/rating -> ratingService.
    // A service vegzi az auth ellenorzest, az upsertet es az atlag ujraszamolast.
    return saveRecipeRating(payload, getCurrentUser());
  });
}
