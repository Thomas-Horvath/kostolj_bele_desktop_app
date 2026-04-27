import { prisma } from "../prisma.js";

export class FavoriteServiceError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = "FavoriteServiceError";
    this.status = status;
  }
}

function assertAuthenticatedUser(currentUser) {
  // Ez a backend oldali utolsó védelmi pont.
  // A frontend már elvileg csak bejelentkezve jut ide,
  // de a service rétegben ettől függetlenül újra ellenőriznünk kell.
  if (!currentUser?.id) {
    throw new FavoriteServiceError("Nem vagy bejelentkezve", { status: 401 });
  }
}

export async function listFavoriteRecipeIds(currentUser) {
  assertAuthenticatedUser(currentUser);

  // A UI-nak a szív állapothoz elég a recept ID-k listája.
  // Nem kérünk le teljes receptobjektumokat, mert az itt felesleges terhelés lenne.
  const favorites = await prisma.favorite.findMany({
    where: { userId: currentUser.id },
    select: { recipeId: true },
  });

  return favorites.map((favorite) => favorite.recipeId);
}

export async function toggleFavoriteRecipe(recipeId, currentUser) {
  assertAuthenticatedUser(currentUser);

  // A renderer felől bármilyen típus érkezhet, ezért a service rétegben is
  // normalizáljuk és validáljuk az inputot.
  const normalizedRecipeId = Number(recipeId);

  if (!Number.isFinite(normalizedRecipeId)) {
    throw new FavoriteServiceError("Érvénytelen recept azonosító.", {
      status: 400,
    });
  }

  const favoriteKey = {
    userId: currentUser.id,
    recipeId: normalizedRecipeId,
  };

  const existingFavorite = await prisma.favorite.findUnique({
    where: { userId_recipeId: favoriteKey },
  });

  // Ez a klasszikus toggle logika:
  // - ha van rekord, töröljük
  // - ha nincs rekord, létrehozzuk
  //
  // Azért nem a renderer dönt erről, mert az adatbázis az egyetlen biztos igazságforrás.
  if (existingFavorite) {
    await prisma.favorite.delete({
      where: { userId_recipeId: favoriteKey },
    });

    return { favorited: false };
  }

  await prisma.favorite.create({
    data: favoriteKey,
  });

  return { favorited: true };
}
