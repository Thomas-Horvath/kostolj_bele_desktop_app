import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("A DATABASE_URL nincs beállítva, ezért a Prisma kliens nem tud elindulni.");
}

// Itt tovabbra is a better-sqlite3 adapteres Prisma kliens fut, DE fontos
// rendszertervezesi megjegyzessel:
// - ezt a Prisma reteget most a Next oldali /api route-ok hasznaljak
// - az Electron main process jelenleg mar nem hivja kozvetlenul
//
// Ezzel a atmeneti szetvalasztassal elkeruljuk, hogy ugyanazt a natív
// better-sqlite3 modult egyszerre kelljen a Node es az Electron ABI-jara
// forditani. A desktop sessiont az Electron kezeli, az adatbazisba lepeshez
// szukseges validaciot pedig atmenetileg a Node oldali route intezi.
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
