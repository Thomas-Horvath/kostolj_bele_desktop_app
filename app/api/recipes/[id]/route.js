import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getRequestUser, isAdminUser } from "../../../../lib/auth";
import { canonicalizeMeasurementUnit } from "../../../../lib/recipeOptions";
import {
    deleteRecipeImage,
    saveRecipeImage,
    validateRecipeImageFile,
} from "../../../../lib/recipeImageStorage";
import slugify from "../../../../utilities/slugify";

export const runtime = "nodejs";








export async function GET(req, { params }) {
    try {
        const resolvedParams = await params;

        const recipe = await prisma.recipe.findUnique({
            where: { id: Number(resolvedParams.id) },
        });

        if (!recipe) {
            return NextResponse.json({ error: "Nincs ilyen recept" }, { status: 404 });
        }

        return NextResponse.json(recipe);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Hiba történt" }, { status: 500 });
    }
}



export async function PUT(req, { params }) {
    try {
        const resolvedParams = await params;

        // Módosítani csak a recept szerzője vagy admin tud.
        const currentUser = await getRequestUser(req);
        if (!currentUser?.id) {
            return NextResponse.json({ error: "A módosításhoz be kell jelentkezni." }, { status: 401 });
        }

        const formData = await req.formData();

        const name = formData.get("name");
        const note = formData.get("note");
        const slug = slugify(formData.get("slug"));
        const typeParamName = formData.get("typeParamName");
        const ingredients = JSON.parse(formData.get("ingredients"));
        const steps = JSON.parse(formData.get("steps"));
        const file = formData.get("image");

        const type = await prisma.type.findUnique({
            where: { paramName: String(typeParamName) },
        });

        if (!type) {
            return NextResponse.json({ error: "Érvénytelen kategória." }, { status: 400 });
        }

        const existingRecipe = await prisma.recipe.findUnique({
            where: { id: Number(resolvedParams.id) },
        });

        if (!existingRecipe) {
            return NextResponse.json({ error: "Nincs ilyen recept" }, { status: 404 });
        }

        if (existingRecipe.authorId !== currentUser.id && !isAdminUser(currentUser)) {
            return NextResponse.json({ error: "Ehhez a recepthez nincs jogosultságod." }, { status: 403 });
        }

        // Szerkesztésnél is előre megnézzük a slug ütközést,
        // hogy csak akkor maradjon menthető a recept, ha az új cím tényleg egyedi.
        const recipeWithSameSlug = await prisma.recipe.findUnique({
            where: { slug },
        });

        if (recipeWithSameSlug && recipeWithSameSlug.id !== Number(resolvedParams.id)) {
            return NextResponse.json({ error: "Ezzel a névvel már létezik másik recept." }, { status: 400 });
        }

        // --- kép mentés ha van új feltöltve ---
        let imageURL = existingRecipe?.imageURL || null;

        if (file && typeof file === "object") {
            const fileValidationError = validateRecipeImageFile(file);
            if (fileValidationError) {
                return NextResponse.json({ error: fileValidationError }, { status: 400 });
            }

            if (imageURL) {
                await deleteRecipeImage(imageURL);
            }

            imageURL = await saveRecipeImage(file, slug);
        }

        const updatedRecipe = await prisma.recipe.update({
            where: { id: Number(resolvedParams.id) }, // vagy slug: params.slug
            data: {
                name: String(name).trim(),
                note: String(note || "").trim() || null,
                slug,
                // A szerzőt nem engedjük kliensből átírni.
                authorId: existingRecipe.authorId,
                typeId: type.id,
                imageURL,
                ingredients: {
                    deleteMany: {
                        recipeId: Number(resolvedParams.id),
                    },
                    create: ingredients.map((ing) => ({
                        name: String(ing.name).trim(),
                        amount: String(ing.amount).trim(),
                        unit: canonicalizeMeasurementUnit(ing.unit),
                    })),
                },
                steps: {
                    deleteMany: {
                        recipeId: Number(resolvedParams.id),
                    },
                    create: steps.map((s) => ({
                        content: String(s.content).trim(),
                        timer: Number(s.timer),
                    })),
                },
            },
            include: { ingredients: true, steps: true },
        });
    
        return NextResponse.json(updatedRecipe, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Hiba a recept módosításánál" }, { status: 500 });
    }
}




export async function DELETE(req, { params }) {
    try {
        const resolvedParams = await params;

        // Törölni csak a tulajdonos vagy admin tud.
        const currentUser = await getRequestUser(req);
        if (!currentUser?.id) {
            return NextResponse.json({ error: "A törléshez be kell jelentkezni." }, { status: 401 });
        }

        const recipeId = Number(resolvedParams.id);

        // Megkeressük a receptet
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!recipe) {
            return NextResponse.json({ error: "Nincs ilyen recept" }, { status: 404 });
        }

        if (recipe.authorId !== currentUser.id && !isAdminUser(currentUser)) {
            return NextResponse.json({ error: "Ehhez a recepthez nincs jogosultságod." }, { status: 403 });
        }

        // Ha van kép, töröljük a fájlrendszerből
        if (recipe.imageURL) {
            await deleteRecipeImage(recipe.imageURL);
        }

        // Töröljük az adatbázisból
        await prisma.recipe.delete({
            where: { id: recipeId },
        });
      
        return NextResponse.json({ message: "Recept törölve" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Hiba történt a recept törlésekor" }, { status: 500 });
    }
}
