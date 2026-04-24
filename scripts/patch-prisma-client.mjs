import fs from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const prismaClientDir = path.join(PROJECT_ROOT, "node_modules", "@prisma", "client");

const shimContent = `"use strict";

/*
  Ez a fajl tudatos kompatibilitasi javitas a desktop buildhez.

  Miert kell?
  - A Prisma alap csomagja normal esetben a rejtett \`.prisma/client\` mappara mutat.
  - Electron buildnel ez a rejtett mappa nem mindig kerul be megbizhatoan a telepitett appba.
  - A projekt viszont mar kulon, sajat \`generated/prisma\` kliensmappat general.

  Ezert itt attereljuk az \`@prisma/client\` alap belepesi pontjat a mi
  sajat generalt kliensunkre. Igy ha barmelyik buildelt resz megis az
  \`@prisma/client\` csomagot probalja behuzni, akkor sem a hianyzo
  \`.prisma/client/default\` lancra fog futni.
*/
module.exports = {
  ...require("../../../generated/prisma/default.js"),
};
`;

async function patchFile(fileName) {
  const targetPath = path.join(prismaClientDir, fileName);
  await fs.writeFile(targetPath, shimContent, "utf8");
}

async function main() {
  await patchFile("index.js");
  await patchFile("default.js");
  console.log("[patch-prisma-client] Az @prisma/client shim frissitve lett.");
}

main().catch((error) => {
  console.error("[patch-prisma-client] Sikertelen futas:", error);
  process.exitCode = 1;
});
