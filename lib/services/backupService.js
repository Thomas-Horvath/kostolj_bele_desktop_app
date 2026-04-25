import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../prisma.js";
import { getDesktopDataPaths } from "../../electron/paths.js";

const BACKUP_MANIFEST_FILE_NAME = "metadata.json";
const BACKUP_DATABASE_FILE_NAME = "app.db";
const BACKUP_IMAGES_DIRECTORY_NAME = "recipe-images";

function formatBackupTimestamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // A helyi idot irjuk ki, hogy a fajlnev es a metadata is emberileg
  // olvashato legyen magyar hasznalatnal is.
  return `${year}-${month}-${day}-${hours}-${minutes}`;
}

export function buildBackupFolderName(date = new Date()) {
  // A backup mappa neve tudatosan egyszeru es emberileg olvashato,
  // hogy fajlkezelo szinten is egyertelmu legyen, mikor keszult a mentes.
  return `kostolj-bele-backup-${formatBackupTimestamp(date)}`;
}

function getBackupLayout(baseDirectoryPath) {
  const normalizedBasePath = path.resolve(baseDirectoryPath);

  return {
    basePath: normalizedBasePath,
    databasePath: path.join(normalizedBasePath, BACKUP_DATABASE_FILE_NAME),
    imagesDirectoryPath: path.join(
      normalizedBasePath,
      BACKUP_IMAGES_DIRECTORY_NAME
    ),
    manifestPath: path.join(normalizedBasePath, BACKUP_MANIFEST_FILE_NAME),
  };
}

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function countFilesInDirectory(directoryPath) {
  if (!(await pathExists(directoryPath))) {
    return 0;
  }

  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).length;
}

async function writeBackupManifest(manifestPath, data) {
  await fs.writeFile(manifestPath, JSON.stringify(data, null, 2), "utf8");
}

export async function createBackupAtDirectory(targetDirectoryPath, electronApp) {
  const desktopPaths = getDesktopDataPaths(electronApp);
  const backupLayout = getBackupLayout(targetDirectoryPath);
  const createdAt = formatBackupTimestamp();

  await ensureDirectory(backupLayout.basePath);
  await ensureDirectory(backupLayout.imagesDirectoryPath);

  // Export elott lezarjuk a Prisma kapcsolatot, hogy a masolt SQLite fajl a
  // leheto legkonzisztensebb allapotban keruljon a backup mappaba. A kovetkezo
  // lekerdezesnel a kliens szukseg eseten ujra kapcsolodni tud.
  await prisma.$disconnect();

  await fs.copyFile(desktopPaths.databasePath, backupLayout.databasePath);

  if (await pathExists(desktopPaths.recipeImagesDir)) {
    await fs.cp(desktopPaths.recipeImagesDir, backupLayout.imagesDirectoryPath, {
      recursive: true,
      force: true,
    });
  }

  const imageCount = await countFilesInDirectory(backupLayout.imagesDirectoryPath);
  const manifest = {
    appName: "Kostolj Bele",
    backupVersion: 1,
    createdAt,
    databaseFile: BACKUP_DATABASE_FILE_NAME,
    imagesDirectory: BACKUP_IMAGES_DIRECTORY_NAME,
    imageCount,
  };

  await writeBackupManifest(backupLayout.manifestPath, manifest);

  return {
    backupDirectoryPath: backupLayout.basePath,
    manifest,
  };
}

export async function validateBackupDirectory(sourceDirectoryPath) {
  const backupLayout = getBackupLayout(sourceDirectoryPath);

  const [hasManifest, hasDatabase] = await Promise.all([
    pathExists(backupLayout.manifestPath),
    pathExists(backupLayout.databasePath),
  ]);

  if (!hasManifest) {
    throw new Error(
      "A kiválasztott mappában nem található metadata.json, ezért ez nem tűnik érvényes backupnak."
    );
  }

  if (!hasDatabase) {
    throw new Error(
      "A kiválasztott backup mappában hiányzik az app.db adatbázisfájl."
    );
  }

  const manifestContent = await fs.readFile(backupLayout.manifestPath, "utf8");
  const manifest = JSON.parse(manifestContent);

  return {
    manifest,
    backupLayout,
  };
}

export async function restoreBackupFromDirectory(sourceDirectoryPath, electronApp) {
  const desktopPaths = getDesktopDataPaths(electronApp);
  const { manifest, backupLayout } = await validateBackupDirectory(
    sourceDirectoryPath
  );

  await ensureDirectory(desktopPaths.databaseDir);
  await ensureDirectory(desktopPaths.recipeImagesDir);

  // Visszaallitas elott kotelezoen lezarjuk a Prisma kapcsolatot, kulonben a
  // Windows alatt a SQLite fajl zar alatt maradhatna, es a csere sikertelen lenne.
  await prisma.$disconnect();

  await fs.copyFile(backupLayout.databasePath, desktopPaths.databasePath);

  await fs.rm(desktopPaths.recipeImagesDir, { recursive: true, force: true });
  await ensureDirectory(desktopPaths.recipeImagesDir);

  if (await pathExists(backupLayout.imagesDirectoryPath)) {
    await fs.cp(backupLayout.imagesDirectoryPath, desktopPaths.recipeImagesDir, {
      recursive: true,
      force: true,
    });
  }

  return {
    restoredFrom: path.resolve(sourceDirectoryPath),
    manifest,
  };
}
