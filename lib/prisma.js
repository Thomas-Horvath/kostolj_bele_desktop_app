import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// A Prisma 7 SQLite esetén driver adaptert vár.
// A DATABASE_URL továbbra is ugyanaz marad, így a meglévő .env és deploy beállítások nem borulnak fel.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("A DATABASE_URL nincs beállítva, ezért a Prisma kliens nem tud elindulni.");
}

// A régi SQLite fájlokban a dátumok unixepoch-ms formában vannak eltárolva.
// Ezt itt rögzítjük, hogy a meglévő adatbázis és a Prisma 7 adapter ugyanúgy értelmezze az időbélyegeket.
const adapter = new PrismaBetterSqlite3(
  { url: connectionString },
  { timestampFormat: "unixepoch-ms" }
);

// Fejlesztés közben a globális cache megakadályozza, hogy a hot reload
// újabb és újabb adatbázis-kapcsolatokat nyisson.
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
