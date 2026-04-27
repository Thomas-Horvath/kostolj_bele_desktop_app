import "dotenv/config";
import path from "node:path";
import prismaClientModule from "../generated/prisma/index.js";

const PrismaClient =
  prismaClientModule?.PrismaClient ||
  prismaClientModule?.default?.PrismaClient;

if (!PrismaClient) {
  throw new Error(
    "A PrismaClient export nem erheto el az @prisma/client csomagbol."
  );
}

const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("A DATABASE_URL nincs beállítva, ezért a Prisma kliens nem tud elindulni.");
}

function normalizeConnectionString(url) {
  // Fejlesztés közben a `.env` gyakran relatív SQLite útvonalat tartalmaz.
  // Ezt itt abszolút elérési úttá alakítjuk, hogy a Prisma minden környezetben
  // ugyanazt az adatbázisfájlt találja meg.
  if (!url.startsWith("file:./") && !url.startsWith("file:../")) {
    return url;
  }

  const relativeFilePath = url.slice("file:".length);
  const absoluteFilePath = path.resolve(process.cwd(), relativeFilePath);

  return `file:${absoluteFilePath.replace(/\\/g, "/")}`;
}

process.env.DATABASE_URL = normalizeConnectionString(connectionString);

// A Prisma klienst nem a rejtett `node_modules/.prisma` lancbol, hanem a
// projekt sajat `generated/prisma` mappajabol importaljuk.
// Ez Electron buildnel kiszamithatobb, mert ezt a mappat mi magunk csomagoljuk.
//
// Itt a teljes desktop backend ezt az egyetlen Prisma reteget hasznalja:
// - auth
// - receptek
// - profil
// - kedvencek

// Fejlesztés közben a globális cache megakadályozza, hogy a hot reload
// újabb és újabb adatbázis-kapcsolatokat nyisson.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
