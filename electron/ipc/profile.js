import { getCurrentUser } from "../state/sessionStore.js";
import {
  createUserFromProfile,
  getProfileData,
} from "../../lib/services/profileService.js";

export function registerProfileIpc(ipcMain) {
  ipcMain.handle("profile:get", async () => {
    // A profil domain most mar kozvetlenul service alapon mukodik:
    // renderer -> preload -> ipc/profile -> profileService -> Prisma/SQLite.
    return getProfileData(getCurrentUser());
  });

  ipcMain.handle("profile:create-user", async (_event, payload) => {
    // Uj felhasznalot csak admin hozhat letre. A jogosultsagot nem a rendererre
    // bizzuk, hanem a service-ben ellenorizzuk az aktualis desktop user alapjan.
    return createUserFromProfile(payload, getCurrentUser());
  });
}
