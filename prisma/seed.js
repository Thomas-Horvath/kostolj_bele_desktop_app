import "dotenv/config";
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

  // A projekt kérésének megfelelően két fix userrel készül az alapállapot.
  // Tamás admin, Katinka normál felhasználó.
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
        name: "Katinka",
        username: "Katinka",
        emailVerified: new Date(),
        email: "kate@example.com",
        password: await bcrypt.hash("Password", 10),
      }
    ],
  });

  const allUsers = await prisma.user.findMany();
  const tamas = allUsers.find((u) => u.username === "Tamás");
  const katinka = allUsers.find((u) => u.username === "Katinka");


  // A minta recepteket váltakozva osztjuk ki a két felhasználó között.
  const recipeAuthors = [tamas, katinka];
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

    // A kedvencek vegyesen kerülnek szétosztásra,
    // így a seedelt adat közelebb áll a valós használathoz.
    const favoriteOwner = recipeAuthors[(i + 1) % recipeAuthors.length];
    await prisma.favorite.create({
      data: {
        userId: favoriteOwner.id,
        recipeId: createdRecipe.id,
      },
    });
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
