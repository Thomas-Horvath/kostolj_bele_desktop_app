import { prisma } from "../prisma.js";
import {
  canonicalizeMeasurementUnit,
  sortSubtypesByPreferredOrder,
  sortTypesByPreferredOrder,
} from "../recipeOptions.js";
import {
  deleteRecipeImage,
  saveRecipeImage,
  validateRecipeImageFile,
} from "../recipeImageStorage.js";
import slugify from "../../utilities/slugify.js";
import { ADMIN_ROLE } from "./authService.js";

export class RecipeServiceError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = "RecipeServiceError";
    this.status = status;
  }
}

function assertAuthenticatedUser(currentUser, actionMessage) {
  if (!currentUser?.id) {
    throw new RecipeServiceError(actionMessage, { status: 401 });
  }
}

function isAdminUser(user) {
  return user?.role === ADMIN_ROLE;
}

function assertCanManageRecipe(recipe, currentUser) {
  if (recipe.authorId !== currentUser.id && !isAdminUser(currentUser)) {
    throw new RecipeServiceError("Ehhez a recepthez nincs jogosultságod.", {
      status: 403,
    });
  }
}

function parseRecipeJsonArray(value, fieldName) {
  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value || "[]");

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Lent egységes, felhasználóbarát hibát dobunk.
  }

  throw new RecipeServiceError(`Érvénytelen ${fieldName} adat.`, {
    status: 400,
  });
}

function normalizeRecipePayload(payload = {}) {
  return {
    name: String(payload.name || "").trim(),
    note: String(payload.note || "").trim(),
    slug: slugify(payload.slug || payload.name || ""),
    typeParamName: String(payload.typeParamName || "").trim(),
    subtypeParamName: String(payload.subtypeParamName || "").trim(),
    ingredients: parseRecipeJsonArray(payload.ingredients, "hozzávaló"),
    steps: parseRecipeJsonArray(payload.steps, "elkészítési lépés"),
    file: normalizeRecipeImageFile(payload.file),
  };
}

function normalizeRecipeImageFile(file) {
  if (!file || typeof file !== "object") {
    return null;
  }

  if (typeof file.arrayBuffer === "function") {
    return file;
  }

  if (!file.buffer) {
    return null;
  }

  // Az Electron rendererből érkező File objektumot előbb egyszerű
  // ArrayBufferes payloadra alakítjuk. Itt visszaépítjük azt a minimális
  // File-szerű alakot, amit a meglévő képmentő helper már ismer.
  return {
    name: file.name || "recipe-image",
    type: file.type || "application/octet-stream",
    size: file.size || 0,
    async arrayBuffer() {
      const buffer = Buffer.from(file.buffer);
      return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
    },
  };
}

function validateRequiredRecipeFields(payload) {
  if (
    !payload.name ||
    !payload.typeParamName ||
    !payload.slug ||
    !Array.isArray(payload.ingredients) ||
    !Array.isArray(payload.steps)
  ) {
    throw new RecipeServiceError("Hiányzó mezők", { status: 400 });
  }
}

async function resolveRecipeTypeAndSubtype(typeParamName, subtypeParamName) {
  const type = await prisma.type.findUnique({
    where: { paramName: String(typeParamName) },
    include: {
      subtypes: true,
    },
  });

  if (!type) {
    throw new RecipeServiceError("Érvénytelen kategória.", { status: 400 });
  }

  const subtype = subtypeParamName
    ? type.subtypes.find((item) => item.paramName === subtypeParamName) || null
    : null;

  if (type.subtypes.length > 0 && !subtype) {
    throw new RecipeServiceError(
      "A kiválasztott kategóriához alkategória megadása kötelező.",
      { status: 400 }
    );
  }

  if (type.subtypes.length === 0 && subtypeParamName) {
    throw new RecipeServiceError(
      "Ehhez a kategóriához nem tartozik alkategória.",
      { status: 400 }
    );
  }

  return { type, subtype };
}

function buildIngredientCreateData(ingredients) {
  return ingredients.map((ingredient) => ({
    name: String(ingredient.name || "").trim(),
    amount: String(ingredient.amount || "").trim(),
    unit: canonicalizeMeasurementUnit(ingredient.unit),
  }));
}

function buildStepCreateData(steps) {
  return steps.map((step) => ({
    content: String(step.content || "").trim(),
    timer: Number(step.timer),
  }));
}

function buildRecipeListWhere(query) {
  const normalizedQuery = String(query || "").trim();

  if (!normalizedQuery) {
    return undefined;
  }

  const normalizedSlugQuery = slugify(normalizedQuery);

  return {
    OR: [
      {
        name: {
          contains: normalizedQuery,
        },
      },
      {
        slug: {
          contains: normalizedSlugQuery,
        },
      },
      {
        type: {
          is: {
            OR: [
              {
                name: {
                  contains: normalizedQuery,
                },
              },
              {
                paramName: {
                  contains: normalizedSlugQuery,
                },
              },
            ],
          },
        },
      },
      {
        subtype: {
          is: {
            OR: [
              {
                name: {
                  contains: normalizedQuery,
                },
              },
              {
                paramName: {
                  contains: normalizedSlugQuery,
                },
              },
            ],
          },
        },
      },
    ],
  };
}

function getRecipeCardSelect() {
  return {
    id: true,
    name: true,
    slug: true,
    imageURL: true,
    rate: true,
    type: {
      select: {
        name: true,
        paramName: true,
      },
    },
    subtype: {
      select: {
        name: true,
        paramName: true,
      },
    },
  };
}

function getRecipeDetailInclude() {
  return {
    ingredients: true,
    steps: true,
    type: true,
    subtype: true,
    author: {
      select: {
        id: true,
        name: true,
        username: true,
      },
    },
  };
}

function getEditableRecipeInclude() {
  return {
    ingredients: true,
    steps: true,
    type: true,
    subtype: true,
  };
}

// A receptlista olvasasi logikajat itt centralizaljuk, hogy ugyanazt a
// lekerdezes-szabalyhalmazt hasznalja:
// - a kompatibilitasi Next API route
// - a jovobeli IPC reteg
// - es a renderer oldali lista oldal is
export async function listRecipes(query) {
  return prisma.recipe.findMany({
    where: buildRecipeListWhere(query),
    select: getRecipeCardSelect(),
    orderBy: {
      name: "asc",
    },
  });
}

// Az oldalsavi kategoriakhoz nem nyers adatot, hanem mar rendezett, UI-ra
// alkalmas strukturaformat adunk vissza.
export async function listRecipeTypes() {
  const typeList = await prisma.type.findMany({
    include: {
      subtypes: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return sortTypesByPreferredOrder(typeList).map((type) => ({
    ...type,
    subtypes: sortSubtypesByPreferredOrder(type.paramName, type.subtypes || []),
  }));
}

export async function getRecipeById(recipeId) {
  return prisma.recipe.findUnique({
    where: {
      id: Number(recipeId),
    },
    include: getRecipeDetailInclude(),
  });
}

export async function getRecipeBySlug(slug) {
  return prisma.recipe.findUnique({
    where: {
      slug: String(slug || "").trim(),
    },
    include: getRecipeDetailInclude(),
  });
}

export async function getEditableRecipeBySlug(slug) {
  return prisma.recipe.findUnique({
    where: {
      slug: String(slug || "").trim(),
    },
    include: getEditableRecipeInclude(),
  });
}

// A kategoriak oldalanak mar nem kell kulon Prisma-logikaval foglalkoznia.
// A service egyben adja vissza:
// - a kategoria metadatajat
// - az aktiv alkategoriat
// - es a hozza tartozo receptlistat
export async function getRecipesByCategory(typeParamName, subtypeParamName = "") {
  const normalizedType = String(typeParamName || "").trim();
  const normalizedSubtype = String(subtypeParamName || "").trim();

  const type = await prisma.type.findUnique({
    where: {
      paramName: normalizedType,
    },
    include: {
      subtypes: true,
    },
  });

  if (!type) {
    return null;
  }

  const activeSubtype =
    type.subtypes.find((subtype) => subtype.paramName === normalizedSubtype) || null;

  if (normalizedSubtype && !activeSubtype) {
    return null;
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      type: {
        is: {
          paramName: normalizedType,
        },
      },
      ...(activeSubtype
        ? {
            subtype: {
              is: {
                paramName: activeSubtype.paramName,
              },
            },
          }
        : {}),
    },
    select: getRecipeCardSelect(),
    orderBy: {
      name: "asc",
    },
  });

  return {
    type: {
      id: type.id,
      name: type.name,
      paramName: type.paramName,
    },
    activeSubtype: activeSubtype
      ? {
          id: activeSubtype.id,
          name: activeSubtype.name,
          paramName: activeSubtype.paramName,
        }
      : null,
    recipes,
  };
}

export async function createRecipe(payload, currentUser) {
  assertAuthenticatedUser(
    currentUser,
    "Új recept létrehozásához be kell jelentkezni."
  );

  const normalizedPayload = normalizeRecipePayload(payload);
  validateRequiredRecipeFields(normalizedPayload);

  const { type, subtype } = await resolveRecipeTypeAndSubtype(
    normalizedPayload.typeParamName,
    normalizedPayload.subtypeParamName
  );

  const fileValidationError = validateRecipeImageFile(normalizedPayload.file, {
    required: true,
  });

  if (fileValidationError) {
    throw new RecipeServiceError(fileValidationError, { status: 400 });
  }

  const existingRecipe = await prisma.recipe.findUnique({
    where: { slug: normalizedPayload.slug },
  });

  if (existingRecipe) {
    throw new RecipeServiceError("Ezzel a névvel már létezik recept.", {
      status: 400,
    });
  }

  const imageURL = await saveRecipeImage(
    normalizedPayload.file,
    normalizedPayload.slug
  );

  return prisma.recipe.create({
    data: {
      name: normalizedPayload.name,
      note: normalizedPayload.note || null,
      slug: normalizedPayload.slug,
      imageURL,
      typeId: type.id,
      subtypeId: subtype?.id || null,
      authorId: currentUser.id,
      ingredients: {
        create: buildIngredientCreateData(normalizedPayload.ingredients),
      },
      steps: {
        create: buildStepCreateData(normalizedPayload.steps),
      },
    },
    include: {
      type: true,
      subtype: true,
      ingredients: true,
      steps: true,
    },
  });
}

export async function updateRecipe(recipeId, payload, currentUser) {
  assertAuthenticatedUser(currentUser, "A módosításhoz be kell jelentkezni.");

  const normalizedRecipeId = Number(recipeId);
  const normalizedPayload = normalizeRecipePayload(payload);
  validateRequiredRecipeFields(normalizedPayload);

  const existingRecipe = await prisma.recipe.findUnique({
    where: { id: normalizedRecipeId },
  });

  if (!existingRecipe) {
    throw new RecipeServiceError("Nincs ilyen recept", { status: 404 });
  }

  assertCanManageRecipe(existingRecipe, currentUser);

  const { type, subtype } = await resolveRecipeTypeAndSubtype(
    normalizedPayload.typeParamName,
    normalizedPayload.subtypeParamName
  );

  const recipeWithSameSlug = await prisma.recipe.findUnique({
    where: { slug: normalizedPayload.slug },
  });

  if (recipeWithSameSlug && recipeWithSameSlug.id !== normalizedRecipeId) {
    throw new RecipeServiceError("Ezzel a névvel már létezik másik recept.", {
      status: 400,
    });
  }

  let imageURL = existingRecipe.imageURL || null;

  if (normalizedPayload.file) {
    const fileValidationError = validateRecipeImageFile(normalizedPayload.file);

    if (fileValidationError) {
      throw new RecipeServiceError(fileValidationError, { status: 400 });
    }

    if (imageURL) {
      await deleteRecipeImage(imageURL);
    }

    imageURL = await saveRecipeImage(
      normalizedPayload.file,
      normalizedPayload.slug
    );
  }

  return prisma.recipe.update({
    where: { id: normalizedRecipeId },
    data: {
      name: normalizedPayload.name,
      note: normalizedPayload.note || null,
      slug: normalizedPayload.slug,
      authorId: existingRecipe.authorId,
      typeId: type.id,
      subtypeId: subtype?.id || null,
      imageURL,
      ingredients: {
        deleteMany: {
          recipeId: normalizedRecipeId,
        },
        create: buildIngredientCreateData(normalizedPayload.ingredients),
      },
      steps: {
        deleteMany: {
          recipeId: normalizedRecipeId,
        },
        create: buildStepCreateData(normalizedPayload.steps),
      },
    },
    include: {
      type: true,
      subtype: true,
      ingredients: true,
      steps: true,
    },
  });
}

export async function deleteRecipe(recipeId, currentUser) {
  assertAuthenticatedUser(currentUser, "A törléshez be kell jelentkezni.");

  const normalizedRecipeId = Number(recipeId);
  const recipe = await prisma.recipe.findUnique({
    where: { id: normalizedRecipeId },
  });

  if (!recipe) {
    throw new RecipeServiceError("Nincs ilyen recept", { status: 404 });
  }

  assertCanManageRecipe(recipe, currentUser);

  if (recipe.imageURL) {
    await deleteRecipeImage(recipe.imageURL);
  }

  await prisma.recipe.delete({
    where: { id: normalizedRecipeId },
  });

  return { message: "Recept törölve" };
}
