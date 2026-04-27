import { ipcMain } from "electron";
import { registerAppIpc } from "./app.js";
import { registerAuthIpc } from "./auth.js";
import { registerBackupIpc } from "./backup.js";
import { registerFavoriteIpc } from "./favorites.js";
import { registerImageIpc } from "./images.js";
import { registerProfileIpc } from "./profile.js";
import { registerRecipeIpc } from "./recipes.js";

// Az IPC regisztraciot egy helyre gyujtjuk, hogy a main process tiszta maradjon
// es a kesobbi domainenkenti bovitesek ne kavarodjanak ossze az ablakkezelessel.
//
// Ez a fajl gyakorlatilag egy "kapcsolotabla":
// - a main process innen indul
// - innen kotjuk be az egyes temakorokhoz tartozo csatornakat
// - ha uj domain jelenik meg, ide kerul be a regisztracioja
export function registerIpcHandlers(electronApp) {
  registerAppIpc(ipcMain, electronApp);
  registerAuthIpc(ipcMain);
  registerBackupIpc(ipcMain);
  registerRecipeIpc(ipcMain);
  registerProfileIpc(ipcMain);
  registerFavoriteIpc(ipcMain);
  registerImageIpc(ipcMain);
}
