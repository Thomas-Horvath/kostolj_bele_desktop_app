import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");
const standaloneDir = path.join(nextDir, "standalone");
const standalonePublicDir = path.join(standaloneDir, "public");
const standaloneStaticDir = path.join(standaloneDir, ".next", "static");
const sourcePublicDir = path.join(projectRoot, "public");
const sourceStaticDir = path.join(nextDir, "static");

async function ensurePathExists(targetPath) {
  await fs.access(targetPath);
}

async function copyDirectory(sourceDir, targetDir) {
  await ensurePathExists(sourceDir);
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  await fs.cp(sourceDir, targetDir, {
    recursive: true,
    force: true,
  });
}

async function main() {
  /*
    A Next standalone output csak a szerver futtathato reszet adja.
    A public fajlokat es a .next/static kliens asseteket nekunk kell
    melle tenni, kulonben telepitett appban:
    - eltunnek a stilusok
    - nem jonnek be a public kepek
    - a kliens oldali hidratacio is felborulhat

    Ez a script a desktop buildhez pont ezt kesziti elo.
  */
  await ensurePathExists(standaloneDir);
  await copyDirectory(sourcePublicDir, standalonePublicDir);
  await copyDirectory(sourceStaticDir, standaloneStaticDir);

  console.log(
    "[prepare-standalone-assets] public es .next/static assetek bemasolva a standalone mappaba."
  );
}

main().catch((error) => {
  console.error("[prepare-standalone-assets] Sikertelen futas:", error);
  process.exitCode = 1;
});
