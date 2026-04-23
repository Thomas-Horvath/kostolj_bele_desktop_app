import { prisma } from "../prisma.js";

export class RatingServiceError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = "RatingServiceError";
    this.status = status;
  }
}

function assertAuthenticatedUser(currentUser) {
  if (!currentUser?.id) {
    throw new RatingServiceError("Be kell jelentkezni", { status: 401 });
  }
}

function validateRatingPayload(payload = {}) {
  const recipeId = Number(payload.recipeId);
  const score = Number(payload.score);

  if (!recipeId || !score) {
    throw new RatingServiceError("Hiányzó adat", { status: 400 });
  }

  // Az értékelést backend oldalon is 0.5 és 5 közé korlátozzuk,
  // fél pontos lépésekben. Így a UI-tól függetlenül érvényes marad az adat.
  const isHalfStep = Number.isInteger(score * 2);
  const isValidScore = score >= 0.5 && score <= 5 && isHalfStep;

  if (!isValidScore) {
    throw new RatingServiceError("Az értékelés csak 0.5 és 5 között lehet.", {
      status: 400,
    });
  }

  return { recipeId, score };
}

export async function saveRecipeRating(payload, currentUser) {
  assertAuthenticatedUser(currentUser);

  const { recipeId, score } = validateRatingPayload(payload);

  // Egy user egy receptre csak egy aktív értékelést tart fenn.
  // Ha már létezik, frissítjük, ha nem, létrehozzuk.
  const rating = await prisma.rating.upsert({
    where: {
      userId_recipeId: {
        userId: currentUser.id,
        recipeId,
      },
    },
    update: { score },
    create: {
      userId: currentUser.id,
      recipeId,
      score,
    },
  });

  // Az egyedi user rating mentése után újraszámoljuk a recept publikus átlagát.
  // A kártyák és a részletező oldal ezt az átlagot mutatják.
  const averageResult = await prisma.rating.aggregate({
    where: { recipeId },
    _avg: { score: true },
  });

  const updatedRecipe = await prisma.recipe.update({
    where: { id: recipeId },
    data: { rate: averageResult._avg.score || 0 },
  });

  return {
    rating,
    average: updatedRecipe.rate,
  };
}
