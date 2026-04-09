import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getRequestUser } from "../../../lib/auth";
import { canonicalizeMeasurementUnit } from "../../../lib/recipeOptions";
import {
  saveRecipeImage,
  validateRecipeImageFile,
} from "../../../lib/recipeImageStorage";
import slugify from "../../../utilities/slugify";

export const runtime = "nodejs";

export async function GET(req) {
  // A lista endpoint már tud keresni is, hogy a receptek oldal ugyanazt az
  // API-t használhassa teljes listára és szűrt nézetre is.
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() || "";

  const where = query
    ? {
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            slug: {
              contains: slugify(query),
            },
          },
          {
            type: {
              is: {
                OR: [
                  {
                    name: {
                      contains: query,
                    },
                  },
                  {
                    paramName: {
                      contains: slugify(query),
                    },
                  },
                ],
              },
            },
          },
        ],
      }
    : undefined;

  const recipes = await prisma.recipe.findMany({
    where,
    select: {
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
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(recipes);
}

export async function POST(req) {
  try {
    // Receptet csak bejelentkezett felhasználó hozhat létre.
    // Az authorId-t nem a kliensből bízzuk rá a szerverre, hanem a sessionből vesszük.
    const currentUser = await getRequestUser(req);
    if (!currentUser?.id) {
      return NextResponse.json(
        { error: "Új recept létrehozásához be kell jelentkezni." },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name");
    const note = formData.get("note");
    const slug = formData.get("slug");
    const typeParamName = formData.get("typeParamName");
    const ingredients = JSON.parse(formData.get("ingredients"));
    const steps = JSON.parse(formData.get("steps"));
    const file = formData.get("image");

    // Itt validáljuk, hogy minden kötelező mező ténylegesen megérkezett.
    if (
      !name ||
      !typeParamName ||
      !slug ||
      !Array.isArray(ingredients) ||
      !Array.isArray(steps)
    ) {
      return NextResponse.json({ error: "Hiányzó mezők" }, { status: 400 });
    }

    const type = await prisma.type.findUnique({
      where: { paramName: String(typeParamName) },
    });

    if (!type) {
      return NextResponse.json(
        { error: "Érvénytelen kategória." },
        { status: 400 }
      );
    }

    const fileValidationError = validateRecipeImageFile(file, { required: true });
    if (fileValidationError) {
      return NextResponse.json({ error: fileValidationError }, { status: 400 });
    }

    const normalizedSlug = slugify(slug);

    // A slug egyedi az adatbázisban, ezért létrehozás előtt külön ellenőrizzük,
    // hogy ne 500-as hibává váljon a duplikáció.
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existingRecipe) {
      return NextResponse.json(
        { error: "Ezzel a névvel már létezik recept." },
        { status: 400 }
      );
    }

    const imageURL = await saveRecipeImage(file, normalizedSlug);

    const recipe = await prisma.recipe.create({
      data: {
        name: String(name).trim(),
        note: String(note || "").trim() || null,
        slug: normalizedSlug,
        imageURL,
        typeId: type.id,
        authorId: currentUser.id,
        ingredients: {
          create: ingredients.map((ing) => ({
            name: String(ing.name).trim(),
            amount: String(ing.amount).trim(),
            unit: canonicalizeMeasurementUnit(ing.unit),
          })),
        },
        steps: {
          create: steps.map((s) => ({
            content: String(s.content).trim(),
            timer: Number(s.timer),
          })),
        },
      },
      include: {
        type: true,
        ingredients: true,
        steps: true,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Hiba történt a recept létrehozásakor" },
      { status: 500 }
    );
  }
}
