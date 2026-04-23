import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getDesktopStorageLayout,
  getFallbackDesktopUserDataDir,
} from "../lib/desktopStoragePaths.js";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(CURRENT_DIR, "..");

// A desktop alkalmazasban minden irhato adatot a userData ala tervezunk
// koltoztetni. Ez kesobb kulcsfontossagu lesz, mert a csomagolt alkalmazas
// sajat konyvtara nem megbizhato hely adatbazisnak vagy feltolteseknek.
//
// Mit ad vissza ez a helper?
// - projectRoot: a jelenlegi projekt gyokere
// - userDataDir: az Electron altal kezelt felhasznaloi adatmappa
// - databaseDir/databasePath: a jovobeli SQLite helye
// - recipeImagesDir: a jovobeli desktop kepmappa
// - legacyRecipeImagesDir: a jelenlegi projektbeli kepmappa, atmeneti fallbackkent
export function getDesktopDataPaths(electronApp) {
  // Fejlesztesben es buildelt appban is ugyanazt a mappastrukturat szeretnenk
  // kovetni. Az Electron hivatalos userData helye az elso valasztas, de van
  // fallback is, hogy a szerveroldali helper retegek ugyanigy tudjanak szamolni.
  const userDataDir = electronApp?.getPath
    ? electronApp.getPath("userData")
    : getFallbackDesktopUserDataDir();
  const storageLayout = getDesktopStorageLayout(userDataDir);

  return {
    projectRoot: PROJECT_ROOT,
    ...storageLayout,

    // Ez a jelenlegi projektstruktura szerinti kepmappa.
    // Az atallas elejen fallbackkent meg megtartjuk, hogy a mar meglevo
    // fejlesztoi tartalom ne vesszen el, mikozben elkezdjuk a desktopositast.
    legacyRecipeImagesDir: path.join(PROJECT_ROOT, "uploads", "recipe-images"),
  };
}
