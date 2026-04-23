import { getCurrentUser } from "../state/sessionStore.js";
import {
  createRecipe,
  deleteRecipe,
  getEditableRecipeBySlug,
  getRecipeById,
  getRecipeBySlug,
  getRecipesByCategory,
  listRecipes,
  listRecipeTypes,
  updateRecipe,
} from "../../lib/services/recipeService.js";

// A recipe IPC mostantol mar nem kompatibilitasi /api bridge.
// Ez az elso olyan nagy domain, ahol az Electron main process kozvetlenul
// a service reteget hivja:
//
// renderer -> preload -> ipc/recipes -> recipeService -> Prisma/SQLite
//
// Ettol a React felulet tovabbra is ugyanazt a `recipesClient` API-t hasznalja,
// de a hatterben mar nincs HTTP route-os koztes lepes.
export function registerRecipeIpc(ipcMain) {
  ipcMain.handle("recipes:list", async (_event, query) => {
    const searchValue =
      typeof query === "string" ? query : String(query?.q || "").trim();

    return listRecipes(searchValue);
  });

  ipcMain.handle("recipes:get-by-id", async (_event, id) => {
    const recipe = await getRecipeById(id);

    if (!recipe) {
      throw new Error("Nincs ilyen recept.");
    }

    return recipe;
  });

  ipcMain.handle("recipes:get-by-slug", async (_event, slug) => {
    const recipe = await getRecipeBySlug(slug);

    if (!recipe) {
      throw new Error("Nincs ilyen recept.");
    }

    return recipe;
  });

  ipcMain.handle("recipes:get-editable-by-slug", async (_event, slug) => {
    const recipe = await getEditableRecipeBySlug(slug);

    if (!recipe) {
      throw new Error("Nincs ilyen recept.");
    }

    return recipe;
  });

  ipcMain.handle("recipes:get-by-category", async (_event, payload) => {
    const type = String(payload?.type || "").trim();
    const subtype = String(payload?.subtype || "").trim();
    const categoryData = await getRecipesByCategory(type, subtype);

    if (!categoryData) {
      throw new Error("Nincs ilyen kategoria vagy alkategoria.");
    }

    return categoryData;
  });

  ipcMain.handle("recipes:create", async (_event, payload) => {
    // A bejelentkezett usert mar az Electron sessionStore adja.
    // A service kapja meg, mert ott tortenik a jogosultsag- es authorId logika.
    return createRecipe(payload, getCurrentUser());
  });

  ipcMain.handle("recipes:update", async (_event, payload) => {
    const recipeId = String(payload?.id || "").trim();

    if (!recipeId) {
      throw new Error("A recept modositashoz hianyzik az azonosito.");
    }

    return updateRecipe(recipeId, payload, getCurrentUser());
  });

  ipcMain.handle(
    "recipes:delete",
    async (_event, id) => {
      return deleteRecipe(id, getCurrentUser());
    }
  );

  ipcMain.handle("recipes:list-types", async () => {
    return listRecipeTypes();
  });
}
