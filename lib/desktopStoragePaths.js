import os from "node:os";
import path from "node:path";

const DESKTOP_APP_DIRECTORY_NAME = "Kostolj_Bele";

// Ez a helper egyetlen helyre gyujti, hogy a desktop app irhato adatai
// milyen konyvtarszerkezetben eljenek. Az a cel, hogy ugyanarra a
// gondolkodasra epuljon:
// - az Electron main process
// - a Next route-ok altal hasznalt fajlmuvelet
// - a kesobbi adatbazis- es kepkezeles
//
// Windows alatt a termeszetes hely az APPDATA ala esik:
//   %APPDATA%/Kostolj Bele
//
// Itt taroljuk majd:
// - a jovobeli adatbazist
// - a receptkepeket

export function getFallbackDesktopUserDataDir() {
  const explicitUserDataDir = process.env.KB_USER_DATA_DIR?.trim();
  if (explicitUserDataDir) {
    // Fejlesztes vagy hibakereses kozben ez lehetove teszi, hogy kezileg
    // masik mappaba iranyitsuk az app minden irhato desktop adatat.
    return explicitUserDataDir;
  }

  if (process.platform === "win32") {
    const appDataDir =
      process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appDataDir, DESKTOP_APP_DIRECTORY_NAME);
  }

  if (process.platform === "darwin") {
    return path.join(
      os.homedir(),
      "Library",
      "Application Support",
      DESKTOP_APP_DIRECTORY_NAME
    );
  }

  const xdgConfigDir =
    process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  return path.join(xdgConfigDir, DESKTOP_APP_DIRECTORY_NAME);
}

export function getDesktopStorageLayout(userDataDir = getFallbackDesktopUserDataDir()) {
  // Itt definialjuk a desktop app "irhato" mappaszerkezetet.
  // Fontos, hogy ez mas legyen, mint a forraskod vagy a build konyvtara,
  // mert a csomagolt alkalmazas sajat helyere nem biztonsagos adatot menteni.
  const normalizedUserDataDir = path.resolve(userDataDir);
  const databaseDir = path.join(normalizedUserDataDir, "db");
  const recipeImagesDir = path.join(normalizedUserDataDir, "recipe-images");

  return {
    userDataDir: normalizedUserDataDir,
    databaseDir,
    databasePath: path.join(databaseDir, "app.db"),
    recipeImagesDir,
  };
}
