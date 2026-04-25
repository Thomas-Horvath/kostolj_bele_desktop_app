import { getDesktopApi } from "./getDesktopApi";

const backupClient = {
  exportData() {
    return getDesktopApi().backup.exportData();
  },
  importData() {
    return getDesktopApi().backup.importData();
  },
};

export default backupClient;
