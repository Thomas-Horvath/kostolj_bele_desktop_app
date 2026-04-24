import fsSync from "node:fs";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BrowserWindow, app, dialog, protocol } from "electron";
import {
  DEFAULT_DEV_SERVER_URL,
  DESKTOP_IMAGE_PROTOCOL,
  ELECTRON_APP_NAME,
} from "./config.js";
import { getDesktopDataPaths } from "./paths.js";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PRELOAD_PATH = path.join(CURRENT_DIR, "preload.js");
const FALLBACK_HTML_PATH = path.join(CURRENT_DIR, "renderer-fallback.html");
const APP_ICON_PATH = path.join(CURRENT_DIR, "..", "public", "app-icon.png");

let mainWindow = null;
let packagedRendererProcess = null;
let packagedRendererUrl = null;
let mainLogFilePath = null;

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

function initializeMainLogFile() {
  if (mainLogFilePath) {
    return mainLogFilePath;
  }

  const fallbackBaseDir =
    process.env.APPDATA ||
    process.env.LOCALAPPDATA ||
    process.cwd();
  const logDir = path.join(fallbackBaseDir, "kostolj_bele", "logs");

  fsSync.mkdirSync(logDir, { recursive: true });
  mainLogFilePath = path.join(logDir, "main.log");
  return mainLogFilePath;
}

function writeMainLog(message, extra = "") {
  try {
    const logFilePath = initializeMainLogFile();
    const line = `[${new Date().toISOString()}] ${message}${
      extra ? ` ${extra}` : ""
    }\n`;
    fsSync.appendFileSync(logFilePath, line, "utf8");
  } catch {
    // A logger soha ne allitsa meg az app indulast.
  }
}

initializeMainLogFile();
writeMainLog("Main process indul");

process.on("uncaughtException", (error) => {
  writeMainLog(
    "Uncaught exception",
    error instanceof Error ? `${error.stack || error.message}` : String(error)
  );
  dialog.showErrorBox(
    "Desktop App Hiba",
    `A main process hibaba futott.\n\nLog fajl:\n${mainLogFilePath}`
  );
});

process.on("unhandledRejection", (reason) => {
  writeMainLog("Unhandled rejection", String(reason));
});

function getRendererUrl() {
  // Fejlesztes kozben a renderer egyelore a kulon futtathato Next dev servert jelenti.
  // Emiatt itt elsokent a kulso URL-t keressuk.
  if (process.env.ELECTRON_RENDERER_URL) {
    return process.env.ELECTRON_RENDERER_URL;
  }

  if (!app.isPackaged) {
    return DEFAULT_DEV_SERVER_URL;
  }

  return packagedRendererUrl;
}

async function ensureDesktopDirectories() {
  const paths = getDesktopDataPaths(app);
  writeMainLog("Desktop mappak ellenorzese", JSON.stringify(paths));

  // A desktop appnak stabil irhato helyre van szuksege.
  // Itt keszitjuk elo a jovobeli adatbazis- es kepmappakat.
  await fs.mkdir(paths.databaseDir, { recursive: true });
  await fs.mkdir(paths.recipeImagesDir, { recursive: true });
}

async function ensureBundledRecipeImages() {
  const paths = getDesktopDataPaths(app);
  const bundledRecipeImagesDir = path.join(
    CURRENT_DIR,
    "..",
    "uploads",
    "recipe-images"
  );

  writeMainLog(
    "Bundled receptkepek ellenorzese",
    JSON.stringify({
      bundledRecipeImagesDir,
      desktopRecipeImagesDir: paths.recipeImagesDir,
    })
  );

  let entries = [];

  try {
    entries = await fs.readdir(bundledRecipeImagesDir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      writeMainLog("Nincs bundled receptkep mappa a buildben");
      return;
    }

    throw error;
  }

  let copiedCount = 0;
  let skippedCount = 0;

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const sourcePath = path.join(bundledRecipeImagesDir, entry.name);
    const targetPath = path.join(paths.recipeImagesDir, entry.name);

    try {
      await fs.access(targetPath);
      skippedCount += 1;
      continue;
    } catch {
      // Ha a desktop kepmegorzes helyen meg nincs meg a fajl, akkor az elso
      // indulaskor athozzuk a fejlesztoi projektbol becsomagolt valtozatot.
    }

    await fs.copyFile(sourcePath, targetPath);
    copiedCount += 1;
  }

  writeMainLog(
    "Bundled receptkepek szinkron kesz",
    JSON.stringify({ copiedCount, skippedCount })
  );
}

function toSqliteConnectionString(filePath) {
  // A Prisma SQLite URL a desktop app sajat irhato adatbazisfajljara mutat.
  // Windows alatt a visszaperjeleket normalizaljuk, hogy a connection string
  // stabilan tovabbadhato legyen a Prisma adapternek.
  return `file:${filePath.replace(/\\/g, "/")}`;
}

async function ensureDesktopDatabase() {
  const paths = getDesktopDataPaths(app);
  const bundledDatabasePath = path.join(CURRENT_DIR, "..", "prisma", "dev.db");
  writeMainLog(
    "Desktop adatbazis inicializalas",
    JSON.stringify({
      bundledDatabasePath,
      targetDatabasePath: paths.databasePath,
    })
  );

  // A telepitett alkalmazas ne a forraskod mappajaban keresse az adatbazist,
  // hanem a userData ala masolja ki az alap SQLite fajlt, es utana onnan
  // dolgozzon tovabb.
  try {
    await fs.access(paths.databasePath);
    writeMainLog("Desktop adatbazis mar letezik", paths.databasePath);
  } catch {
    await fs.copyFile(bundledDatabasePath, paths.databasePath);
    writeMainLog("Desktop adatbazis kimasolva", paths.databasePath);
  }

  process.env.DATABASE_URL = toSqliteConnectionString(paths.databasePath);
  writeMainLog("DATABASE_URL beallitva", process.env.DATABASE_URL);
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "127.0.0.1");
  });
}

async function findAvailablePort(startPort = 3010, maxAttempts = 20) {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const port = startPort + offset;
    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error("Nem talalhato szabad port a desktop rendererhez.");
}

async function startPackagedRendererServer() {
  if (!app.isPackaged) {
    return null;
  }

  if (packagedRendererProcess && packagedRendererUrl) {
    return packagedRendererUrl;
  }

  const standaloneDir = path.join(
    process.resourcesPath,
    "app.asar.unpacked",
    ".next",
    "standalone"
  );
  const standaloneServerPath = path.join(standaloneDir, "server.js");
  const port = await findAvailablePort(3010, 1);
  writeMainLog(
    "Packaged renderer inditas elokeszitese",
    JSON.stringify({ standaloneDir, standaloneServerPath, port })
  );

  await fs.access(standaloneDir);
  await fs.access(standaloneServerPath);

  // A telepitett desktop appban a React/Next feluletet a buildelt standalone
  // Next szerver szolgaltatja ki. Ezt helyben, lokalis folyamatkent inditjuk.
  packagedRendererProcess = spawn(process.execPath, [standaloneServerPath], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  packagedRendererProcess.stdout?.on("data", (chunk) => {
    writeMainLog("Renderer stdout", String(chunk).trim());
  });

  packagedRendererProcess.stderr?.on("data", (chunk) => {
    writeMainLog("Renderer stderr", String(chunk).trim());
  });

  packagedRendererProcess.once("error", (error) => {
    writeMainLog(
      "Renderer spawn error",
      error instanceof Error ? `${error.stack || error.message}` : String(error)
    );
  });

  packagedRendererProcess.once("exit", () => {
    writeMainLog("Renderer process kilepett");
    packagedRendererProcess = null;
    packagedRendererUrl = null;
  });

  packagedRendererUrl = `http://127.0.0.1:${port}`;
  writeMainLog("Packaged renderer URL", packagedRendererUrl);
  return packagedRendererUrl;
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
  writeMainLog("Renderer URL feloldva", String(rendererUrl));

  if (!rendererUrl) {
    // Ha nincs renderer URL, akkor meg nem tudunk valodi UI-t betolteni.
    // Ilyenkor egy lokalis HTML tajekoztato oldalt mutatunk.
    await mainBrowserWindow.loadURL(pathToFileURL(FALLBACK_HTML_PATH).toString());
    return;
  }

  const isRendererReachable = await waitForRenderer(rendererUrl);
  writeMainLog(
    "Renderer elerhetoseg",
    JSON.stringify({ rendererUrl, isRendererReachable })
  );

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
  writeMainLog("Main window letrehozva");

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(async () => {
  writeMainLog("app.whenReady elert");
  // Windows alatt ez segit abban, hogy a talca es az ablak ikonja ne a
  // fejlesztoi/default Electron ikonhoz csoportosuljon, hanem a sajat apphoz.
  app.setAppUserModelId("hu.kostoljbele.desktop");

  // Az inditasi sorrend itt tudatos:
  // 1. irhato mappak letrehozasa
  // 2. a buildbe csomagolt kezdo receptkepek kimasolasa az irhato kepmappaba
  // 3. desktop adatbazis inicializalasa
  // 4. desktop protokollok regisztralasa
  // 5. IPC handlerek bekotese
  // 6. ablak letrehozasa
  await ensureDesktopDirectories();
  await ensureBundledRecipeImages();
  await ensureDesktopDatabase();
  await startPackagedRendererServer();
  await registerDesktopProtocols();
  writeMainLog("Desktop protocolok regisztralva");

  // Az IPC handlerek regisztracioja a main process indulasanak resze.
  // A domainenkenti szetvalasztas miatt kesobb fokozatosan lehet a route-ok
  // helyett ezeket bekotni anelkul, hogy a shellt ujra kellene tervezni.
  //
  // Szandekosan dinamikus importot hasznalunk, hogy a service retegekben levo
  // Prisma init csak azutan tortenjen meg, hogy a desktop DATABASE_URL mar a
  // userData ala mutasson.
  const { registerIpcHandlers } = await import("./ipc/index.js");
  registerIpcHandlers(app);
  writeMainLog("IPC handlerek regisztralva");

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
    if (packagedRendererProcess) {
      packagedRendererProcess.kill();
      packagedRendererProcess = null;
      packagedRendererUrl = null;
    }
    app.quit();
  }
});

app.on("before-quit", () => {
  if (packagedRendererProcess) {
    packagedRendererProcess.kill();
    packagedRendererProcess = null;
    packagedRendererUrl = null;
  }
});
