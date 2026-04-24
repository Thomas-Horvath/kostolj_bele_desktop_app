import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
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

// A Prisma klienst nem a rejtett `node_modules/.prisma` lancbol, hanem a
// projekt sajat `generated/prisma` mappajabol importaljuk.
// Ez Electron buildnel kiszamithatobb, mert ezt a mappat mi magunk csomagoljuk.
//
// Itt a teljes desktop backend ezt az egyetlen Prisma reteget hasznalja:
// - auth
// - receptek
// - profil
// - kedvencek
// - rating
const adapter = new PrismaBetterSqlite3(
  { url: connectionString },
  { timestampFormat: "unixepoch-ms" }
);

// Fejlesztés közben a globális cache megakadályozza, hogy a hot reload
// újabb és újabb adatbázis-kapcsolatokat nyisson.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
