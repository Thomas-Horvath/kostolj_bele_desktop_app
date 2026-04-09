import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// A Prisma 7-ben a CLI működését külön config fájl vezérli.
// Itt központilag adjuk meg a sémát, a migrációk helyét, a seed parancsot
// és az adatbázis URL-jét is, hogy a CLI és a build ugyanabból a forrásból dolgozzon.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "node ./prisma/seed.js",
  },
});
