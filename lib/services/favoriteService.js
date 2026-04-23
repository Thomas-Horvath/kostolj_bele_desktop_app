import { prisma } from "../prisma.js";

export class FavoriteServiceError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = "FavoriteServiceError";
    this.status = status;
  }
}

function assertAuthenticatedUser(currentUser) {
  if (!currentUser?.id) {
    throw new FavoriteServiceError("Nem vagy bejelentkezve", { status: 401 });
  }
}

export async function listFavoriteRecipeIds(currentUser) {
  assertAuthenticatedUser(currentUser);

  // A UI-nak a szív állapotához elég a recept ID-k listája.
  // Így nem küldünk át felesleges receptadatot minden kártyához.
  const favorites = await prisma.favorite.findMany({
    where: { userId: currentUser.id },
    select: { recipeId: true },
  });

  return favorites.map((favorite) => favorite.recipeId);
}

export async function toggleFavoriteRecipe(recipeId, currentUser) {
  assertAuthenticatedUser(currentUser);

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
