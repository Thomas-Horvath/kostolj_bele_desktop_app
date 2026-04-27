import "dotenv/config";
import { defineConfig } from "prisma/config";

/*
  Ez a Prisma config fájl a Prisma CLI-nek ad központi kapaszkodót.

  Fontos:
  - A jelenlegi projekt szándékosan Prisma 6-on marad.
  - Ebben a felállásban a klasszikus Prisma kliensünket használjuk,
    nem adapteres Prisma 7-es működést.
  - Emiatt a tényleges SQLite kapcsolat URL-je továbbra is a
    `prisma/schema.prisma` datasource blokkjában marad.

  Mire jó ez a fájl így is?
  - egy helyen megmondjuk, hol van a séma
  - a migráció/seed folyamat ugyanabból a belépési pontból indul
  - a Prisma eszközök és az editor könnyebben felismerik a projektet
*/
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.js",
  },
});
