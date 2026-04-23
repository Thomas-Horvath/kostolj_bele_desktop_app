import {
  clearCurrentUser,
  getCurrentUser,
  isAuthenticated,
  setCurrentUser,
} from "../state/sessionStore.js";
import { loginWithCredentials } from "../../lib/services/authService.js";

// Az auth IPC reteget mar most kulon fajlba tesszuk, mert ez lesz az egyik
// legfontosabb atirasi terulet. Egyelore csak a session allapot olvasasa es
// torlese mukodik, a tenyleges login a service reteg utan kerul ide.
//
// Mi tortenik itt?
// - az ipcMain "csatornakat" kap, amiket a preload tud meghivni
// - pl. `auth:get-current-user`
// - amikor a renderer ezt invokolja, a main process ide erkezik be
//
// A desktop auth mostani iranyelve:
// - az app indulaskor megprobalja visszatolteni az utolso usert
// - a logout torli ezt a lokalis allapotot
// - a login majd ugyanide fogja irni a sikeres usert
export function registerAuthIpc(ipcMain) {
  ipcMain.handle("auth:login", async (_event, credentials) => {
    // A login most mar nem /api/login route-on keresztul megy.
    // Az Electron main process kozvetlenul az auth service-t hivja:
    //
    // renderer -> preload -> ipc/auth -> authService -> Prisma/SQLite
    //
    // Siker eseten tovabbra is itt mentjuk el a desktop sessionStore-ba
    // az utolso bejelentkezett usert.
    const result = await loginWithCredentials(credentials ?? {});

    if (!result.ok) {
      return {
        ok: false,
        field: result.field,
        message: result.message,
        user: null,
        isAuthenticated: false,
      };
    }

    const user = setCurrentUser(result.user);

    return {
      ok: true,
      user,
      isAuthenticated: true,
    };
  });

  ipcMain.handle("auth:get-current-user", async () => {
    return {
      ok: true,
      user: getCurrentUser(),
      isAuthenticated: isAuthenticated(),
    };
  });

  ipcMain.handle("auth:logout", async () => {
    clearCurrentUser();

    return {
      ok: true,
      user: null,
      isAuthenticated: false,
    };
  });
}
