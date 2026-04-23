import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BrowserWindow, app, protocol } from "electron";
import {
  DEFAULT_DEV_SERVER_URL,
  DESKTOP_IMAGE_PROTOCOL,
  ELECTRON_APP_NAME,
} from "./config.js";
import { registerIpcHandlers } from "./ipc/index.js";
import { getDesktopDataPaths } from "./paths.js";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PRELOAD_PATH = path.join(CURRENT_DIR, "preload.js");
const FALLBACK_HTML_PATH = path.join(CURRENT_DIR, "renderer-fallback.html");
const APP_ICON_PATH = path.join(CURRENT_DIR, "..", "public", "app-icon.png");

let mainWindow = null;

/*
  FONTOS MENTALIS MODELL EHHEZ A FAJLHOZ

  Ez a fajl az Electron "main process" belepesi pontja.
  Ezt ugy erdemes elkepzelni, mint a desktop alkalmazas Node.js szeru hatterfolyamata.

  Ez FELEL:
  - az alkalmazasablak letrehozasaert
  - a preload script bekoteseert
  - a desktop-specifikus fajl- es adatutvonalak elokesziteseert
  - az IPC handlerek regisztralasaert
  - a lokalis kepeleresi protokollert

  Ez NEM FELEL:
  - a React UI megjeleniteseert kozvetlenul
  - a konkret uzleti logika teljes implementaciojaert
  - a jelenlegi Next API route-ok futtatasaert

  A renderer (vagyis a React/Next felulet) ehhez a main processhez a preloadon
  keresztul tud majd biztonsagosan szolni.
*/

// A sajat image protocolot mar az alkalmazas indulasa elott fel kell jegyezni,
// kulonben a renderer nem tudja majd biztonsagos lokalis eroforraskent kezelni.
protocol.registerSchemesAsPrivileged([
  {
    scheme: DESKTOP_IMAGE_PROTOCOL,
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

function getRendererUrl() {
  // Fejlesztes kozben a renderer egyelore a kulon futtathato Next dev servert jelenti.
  // Emiatt itt elsokent a kulso URL-t keressuk.
  if (process.env.ELECTRON_RENDERER_URL) {
    return process.env.ELECTRON_RENDERER_URL;
  }

  if (!app.isPackaged) {
    return DEFAULT_DEV_SERVER_URL;
  }

  return null;
}

async function ensureDesktopDirectories() {
  const paths = getDesktopDataPaths(app);

  // A desktop appnak stabil irhato helyre van szuksege.
  // Itt keszitjuk elo a jovobeli adatbazis- es kepmappakat.
  await fs.mkdir(paths.databaseDir, { recursive: true });
  await fs.mkdir(paths.recipeImagesDir, { recursive: true });
}

function getImageContentType(fileName) {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return "application/octet-stream";
}

async function resolveRecipeImageFile(imageName) {
  const paths = getDesktopDataPaths(app);
  const normalizedName = String(imageName || "")
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .at(-1);

  if (!normalizedName || path.basename(normalizedName) !== normalizedName) {
    return null;
  }

  const candidates = [
    path.join(paths.recipeImagesDir, normalizedName),
    path.join(paths.legacyRecipeImagesDir, normalizedName),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // A kovetkezo jeloltet probaljuk, mert atmenetileg ket kephelyet is
      // tamogatunk: a regi projektmappat es a jovobeli userData mappat.
    }
  }

  return null;
}

async function registerDesktopProtocols() {
  // Itt kotjuk ossze a sajat `kb-image://` protocolt a valos fajlrendszerrel.
  // A renderer igy kesobb ugy tud kepet kerni, mintha URL-t hasznalna,
  // mikozben a valodi fajlmuvelet tovabbra is a desktop backend oldalon marad.
  protocol.handle(DESKTOP_IMAGE_PROTOCOL, async (request) => {
    const requestUrl = new URL(request.url);
    const requestedImageName = decodeURIComponent(
      `${requestUrl.hostname}${requestUrl.pathname}`
    );
    const filePath = await resolveRecipeImageFile(requestedImageName);

    if (!filePath) {
      return new Response("A kert kep nem talalhato.", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "content-type": getImageContentType(filePath),
        "cache-control": "no-store",
      },
    });
  });
}

async function waitForRenderer(url, attempts = 30, delayMs = 500) {
  // Fejlesztesben gyakori, hogy az Electron hamarabb indul, mint a Next dev szerver.
  // Ezert egy egyszeru varakozo ciklussal figyeljuk, mikor valik elerhetove a renderer.
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": `${ELECTRON_APP_NAME}-desktop-shell`,
        },
      });

      if (response.ok) {
        return true;
      }
    } catch {
      // Dev modban teljesen normalis, hogy a Next dev server csak nehany
      // masodperccel az Electron utan all fel. Itt csendben varunk.
    }

    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }

  return false;
}

async function loadRenderer(mainBrowserWindow) {
  const rendererUrl = getRendererUrl();

  if (!rendererUrl) {
    // Ha nincs renderer URL, akkor meg nem tudunk valodi UI-t betolteni.
    // Ilyenkor egy lokalis HTML tajekoztato oldalt mutatunk.
    await mainBrowserWindow.loadURL(pathToFileURL(FALLBACK_HTML_PATH).toString());
    return;
  }

  const isRendererReachable = await waitForRenderer(rendererUrl);

  if (isRendererReachable) {
    await mainBrowserWindow.loadURL(rendererUrl);
    return;
  }

  await mainBrowserWindow.loadURL(pathToFileURL(FALLBACK_HTML_PATH).toString());
}

async function createMainWindow() {
  // Ez maga a natív desktop ablak.
  // A preload itt kerul bekotesre, mert a renderer csak ezen keresztul kaphat
  // biztonsagos hozzaferest a desktop backend funkcioihoz.
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1180,
    minHeight: 760,
    title: ELECTRON_APP_NAME,
    // Fejlesztes kozben az Electron ablak ikonja is ugyanazt a brand ikont
    // hasznalja, amit a rendererben a header/footer logo is megjelenit.
    icon: APP_ICON_PATH,
    autoHideMenuBar: true,
    backgroundColor: "#f7f1e8",
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  await loadRenderer(mainWindow);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(async () => {
  // Windows alatt ez segit abban, hogy a talca es az ablak ikonja ne a
  // fejlesztoi/default Electron ikonhoz csoportosuljon, hanem a sajat apphoz.
  app.setAppUserModelId("hu.kostoljbele.desktop");

  // Az inditasi sorrend itt tudatos:
  // 1. irhato mappak letrehozasa
  // 2. desktop protokollok regisztralasa
  // 3. IPC handlerek bekotese
  // 4. ablak letrehozasa
  await ensureDesktopDirectories();
  await registerDesktopProtocols();

  // Az IPC handlerek regisztracioja a main process indulasanak resze.
  // A domainenkenti szetvalasztas miatt kesobb fokozatosan lehet a route-ok
  // helyett ezeket bekotni anelkul, hogy a shellt ujra kellene tervezni.
  registerIpcHandlers(app);

  await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Windows/Linux alatt kilepunk, ha az utolso ablak is bezarult.
  // Mac-en jellemzoen eletben marad az app, ezert ott nem quitelunk automatikusan.
  if (process.platform !== "darwin") {
    app.quit();
  }
});
