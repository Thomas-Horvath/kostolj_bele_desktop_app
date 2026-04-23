import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import { prisma } from "../lib/prisma.js";
import {
  CATEGORY_DEFINITIONS,
  normalizeSeedIngredient,
  resolveSeedCategory,
  resolveSeedSubtype,
} from "../lib/recipeOptions.js";

// A package.json már ESM módot használ, ezért a seedet is import alapúvá tesszük.
// A JSON-t kézzel olvassuk be, így nem kell import attribute támogatásra támaszkodni.
const recipesData = JSON.parse(
  await readFile(new URL("./recipes.json", import.meta.url), "utf8")
);

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.step.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.subtype.deleteMany();
  await prisma.type.deleteMany();
  await prisma.user.deleteMany();

  // A kategóriákat upserteljük, hogy többszöri seednél se duplázódjanak.
  for (const type of CATEGORY_DEFINITIONS) {
    const { subtypes = [], ...typeData } = type;

    await prisma.type.upsert({
      where: { paramName: typeData.paramName },
      update: { name: typeData.name },
      create: typeData,
    });

    for (const subtype of subtypes) {
      await prisma.subtype.upsert({
        where: { paramName: subtype.paramName },
        update: {
          name: subtype.name,
          type: {
            connect: { paramName: typeData.paramName },
          },
        },
        create: {
          name: subtype.name,
          paramName: subtype.paramName,
          type: {
            connect: { paramName: typeData.paramName },
          },
        },
      });
    }
  }

  // A projekt kérésének megfelelően három fix userrel készül az alapállapot.
  // Tamás admin, Katinka és Test normál felhasználó.
  await prisma.user.createMany({
    data: [
      {
        name: "Tamás",
        username: "Tamás",
        emailVerified: new Date(),
        email: "tomi@example.com",
        password: await bcrypt.hash("Password", 10),
        role: "ADMIN",
      },
      {
        name: "Károly",
        username: "Károly",
        emailVerified: new Date(),
        email: "kar@example.com",
        password: await bcrypt.hash("Password", 10),
      },
      {
        name: "Test",
        username: "Test",
        emailVerified: new Date(),
        email: "test@example.com",
        password: await bcrypt.hash("Password", 10),
      },
    ],
  });

  const allUsers = await prisma.user.findMany();
  const tamas = allUsers.find((u) => u.username === "Tamás");
  const karoly = allUsers.find((u) => u.username === "Károly");
  const testUser = allUsers.find((u) => u.username === "Test");

  // A minta recepteket váltakozva osztjuk ki a három felhasználó között.
  const recipeAuthors = [tamas, karoly, testUser];
  for (let i = 0; i < recipesData.length; i++) {
    const recipe = recipesData[i];
    const author = recipeAuthors[i % recipeAuthors.length];
    const categoryParamName = resolveSeedCategory(recipe);
    const subtypeParamName = resolveSeedSubtype(recipe, categoryParamName);

    const createdRecipe = await prisma.recipe.create({
      data: {
        name: recipe.name,
        slug: recipe.slug,
        imageURL: recipe.imageURL,
        note: recipe.note?.trim() || null,
        rate: recipe.rate ?? 4.0,
        author: {
          connect: { id: author.id },
        },
        type: {
          connect: { paramName: categoryParamName },
        },
        ...(subtypeParamName
          ? {
              subtype: {
                connect: { paramName: subtypeParamName },
              },
            }
          : {}),
        ingredients: {
          create: recipe.ingredients.map((ingredient) =>
            normalizeSeedIngredient(ingredient)
          ),
        },
        steps: {
          create: recipe.steps.map((step) => ({
            content: step.content,
            timer: step.timer,
          })),
        },
      },
    });

    // A kedvencek és ratingek vegyesen kerülnek szétosztásra,
    // így a seedelt adat közelebb áll a valós használathoz.
    const favoriteOwner = recipeAuthors[(i + 1) % recipeAuthors.length];
    await prisma.favorite.create({
      data: {
        userId: favoriteOwner.id,
        recipeId: createdRecipe.id,
      },
    });

    const usersForRating = [tamas, katinka, testUser];
    for (const user of usersForRating) {
      const randomScore = Math.floor(Math.random() * 5) + 1;
      await prisma.rating.create({
        data: {
          userId: user.id,
          recipeId: createdRecipe.id,
          score: randomScore,
        },
      });
    }
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
