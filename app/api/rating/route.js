import { prisma } from "../../../lib/prisma";
import { getRequestUser } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
    const currentUser = await getRequestUser(req);

    if (!currentUser?.id) {
        return NextResponse.json({ error: "Be kell jelentkezni" }, { status: 401 });
    }

    const { recipeId, score } = await req.json();
    const normalizedRecipeId = Number(recipeId);
    const normalizedScore = Number(score);

    // Az értékelést szerveren is korlátozzuk 0.5 és 5 közé, fél pontos lépésekben.
    if (!normalizedRecipeId || !normalizedScore) {
        return NextResponse.json({ error: "Hiányzó adat" }, { status: 400 });
    }

    const isHalfStep = Number.isInteger(normalizedScore * 2);
    const isValidScore =
        normalizedScore >= 0.5 && normalizedScore <= 5 && isHalfStep;

    if (!isValidScore) {
        return NextResponse.json({ error: "Az értékelés csak 0.5 és 5 között lehet." }, { status: 400 });
    }

    try {
        const rating = await prisma.rating.upsert({
            where: {
                userId_recipeId: {
                    userId: currentUser.id,
                    recipeId: normalizedRecipeId,
                },
            },
            update: { score: normalizedScore },
            create: {
                userId: currentUser.id,
                recipeId: normalizedRecipeId,
                score: normalizedScore,
            },
        });

        // Frissítjük a recept átlagát
        const avg = await prisma.rating.aggregate({
            where: { recipeId: normalizedRecipeId },
            _avg: { score: true },
        });

        const updatedRecipe = await prisma.recipe.update({
            where: { id: normalizedRecipeId },
            data: { rate: avg._avg.score || 0 },
        });

        return NextResponse.json({ rating, average: updatedRecipe.rate },
            { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Hiba az értékelésnél" }, { status: 500 });
    }
}
