import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getRequestUser, isAdminUser } from "../../../../lib/auth";


export async function GET(req, { params }) {
    try {
        const resolvedParams = await params;

        // A szerkesztési adatokhoz csak a recept szerzője vagy admin férhet hozzá.
        const currentUser = await getRequestUser(req);
        if (!currentUser?.id) {
            return NextResponse.json({ error: "A szerkesztéshez be kell jelentkezni." }, { status: 401 });
        }

        const recipe = await prisma.recipe.findUnique({
            where: { slug: resolvedParams.slug },
            include: {
                ingredients: true,
                steps: true,
                type: true,
            },
        });

        if (!recipe) {
            return NextResponse.json({ error: "Nincs ilyen recept" }, { status: 404 });
        }

        if (recipe.authorId !== currentUser.id && !isAdminUser(currentUser)) {
            return NextResponse.json({ error: "Ehhez a recepthez nincs jogosultságod." }, { status: 403 });
        }

        return NextResponse.json(recipe);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Hiba történt" }, { status: 500 });
    }
}


