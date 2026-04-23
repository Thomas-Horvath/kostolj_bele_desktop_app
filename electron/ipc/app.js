import { getDesktopDataPaths } from "../paths.js";

// Az "app" namespace altalanos desktop metadata-t es futasi informaciot ad a
// renderernek. Ezek nem uzleti funkciok, hanem a shell allapotat segitenek
// debugolni es a kesobbi UI-integraciot tamogatjak.
export function registerAppIpc(ipcMain, electronApp) {
  ipcMain.handle("app:get-runtime-info", async () => {
    const paths = getDesktopDataPaths(electronApp);

    return {
      isElectron: true,
      isPackaged: electronApp.isPackaged,
      platform: process.platform,
      versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
      },
      paths,
    };
  });
}

