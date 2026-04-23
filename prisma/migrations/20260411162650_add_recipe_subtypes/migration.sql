-- CreateTable
CREATE TABLE "Subtype" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "paramName" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    CONSTRAINT "Subtype_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageURL" TEXT NOT NULL,
    "note" TEXT,
    "rate" REAL DEFAULT 4.0,
    "typeId" INTEGER NOT NULL,
    "subtypeId" INTEGER,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Recipe_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recipe_subtypeId_fkey" FOREIGN KEY ("subtypeId") REFERENCES "Subtype" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Recipe_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Recipe" ("authorId", "id", "imageURL", "name", "note", "rate", "slug", "typeId") SELECT "authorId", "id", "imageURL", "name", "note", "rate", "slug", "typeId" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Subtype_paramName_key" ON "Subtype"("paramName");

-- CreateIndex
CREATE UNIQUE INDEX "Subtype_typeId_name_key" ON "Subtype"("typeId", "name");
