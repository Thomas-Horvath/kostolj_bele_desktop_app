import { DESKTOP_IMAGE_PROTOCOL } from "../config.js";

function sanitizeImageName(imageName) {
  // A rendererbol erkezhet regi webes kepeleres is, de az Electron oldali
  // kepkiszolgalo mindig csak fajlnevet var. Ezzel elkeruljuk, hogy veletlenul
  // teljes vagy relativ fajlutvonal keruljon a custom protocol URL-be.
  return String(imageName || "")
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .at(-1);
}

export function registerImageIpc(ipcMain) {
  ipcMain.handle("images:select-file", async () => {
    // A file picker kesobb ide kerulhet, ha kulon desktop kepvalasztast
    // szeretnenk. Jelenleg a form meg a HTML file inputot hasznalja.
    return null;
  });

  ipcMain.handle("images:get-url", async (_event, imageName) => {
    // Ez a helper ugyanazt az URL formatumot adja vissza, amit a
    // lib/recipeImageUrl.js is hasznal. Akkor lesz hasznos, ha kesobb
    // teljesen renderer-only helper helyett IPC-n akarjuk feloldani a kep URL-t.
    const normalizedName = sanitizeImageName(imageName);

    if (!normalizedName) {
      return "/banner6.webp";
    }

    return `${DESKTOP_IMAGE_PROTOCOL}://${encodeURIComponent(normalizedName)}`;
  });
}
