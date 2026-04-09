-- A hozzávalóknál megszüntetjük a régi "type" mezőt, mert a felhasználói űrlap
-- innentől mennyiség + mértékegység párosítással dolgozik.
-- Az amount mező a korábbi quantity tartalmat viszi tovább, hogy a meglévő adatok se vesszenek el.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Ingredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "unit" TEXT,
    "recipeId" INTEGER NOT NULL,
    CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Ingredient" ("id", "name", "amount", "unit", "recipeId")
SELECT "id", "name", "quantity", NULL, "recipeId"
FROM "Ingredient";

DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
