import { app, dialog } from "electron";
import path from "node:path";
import {
  buildBackupFolderName,
  createBackupAtDirectory,
  restoreBackupFromDirectory,
} from "../../lib/services/backupService.js";

export function registerBackupIpc(ipcMain) {
  ipcMain.handle("backup:export", async () => {
    // Exportnal a user egy celmappat valaszt. A backup azon belul kap egy sajat,
    // datumozott almappat, hogy tobb mentes is elferjen egymas mellett.
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: "Backup mentési hely kiválasztása",
      properties: ["openDirectory", "createDirectory"],
      buttonLabel: "Mentés ide",
    });

    if (canceled || !filePaths[0]) {
      return { canceled: true };
    }

    const backupDirectoryPath = path.join(
      filePaths[0],
      buildBackupFolderName()
    );
    const result = await createBackupAtDirectory(backupDirectoryPath, app);

    await dialog.showMessageBox({
      type: "info",
      title: "Backup elkészült",
      message: "A biztonsági mentés sikeresen elkészült.",
      detail: `Mentés helye:\n${result.backupDirectoryPath}`,
    });

    return {
      canceled: false,
      ...result,
    };
  });

  ipcMain.handle("backup:import", async () => {
    // Visszaallitasnal a backup gyokermappajat valasztjuk ki. Ebben kell
    // lennie a metadata.json-nek, az app.db-nek es a recipe-images mappanak.
    const selection = await dialog.showOpenDialog({
      title: "Backup mappa kiválasztása",
      properties: ["openDirectory"],
      buttonLabel: "Mappa kiválasztása",
    });

    if (selection.canceled || !selection.filePaths[0]) {
      return { canceled: true };
    }

    const confirmResult = await dialog.showMessageBox({
      type: "warning",
      buttons: ["Visszaállítás", "Mégse"],
      defaultId: 1,
      cancelId: 1,
      noLink: true,
      title: "Backup visszaállítása",
      message: "Biztosan vissza szeretnéd állítani ezt a mentést?",
      detail:
        "A jelenlegi adatbázis és a mostani receptképek felül lesznek írva. A művelet után az alkalmazás újraindul.",
    });

    if (confirmResult.response !== 0) {
      return { canceled: true };
    }

    const result = await restoreBackupFromDirectory(selection.filePaths[0], app);

    await dialog.showMessageBox({
      type: "info",
      title: "Visszaállítás kész",
      message: "A backup visszaállítása sikeresen befejeződött.",
      detail: "Az alkalmazás most újraindul, hogy az új adatok töltődjenek be.",
    });

    app.relaunch();
    app.quit();

    return {
      canceled: false,
      restarting: true,
      ...result,
    };
  });
}
