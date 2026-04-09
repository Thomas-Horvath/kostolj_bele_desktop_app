import { NextResponse } from "next/server";
import { getRequestUser, isAdminUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(req) {
    const currentUser = await getRequestUser(req);

    // Előfordulhat, hogy van auth objektum, de a user rész hiányos.
    // Ilyenkor ugyanúgy nem tekintjük bejelentkezett állapotnak a kérést.
    if (!currentUser?.id) {
        return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });
    }

    const userId = currentUser.id;

    const ownRecipes = await prisma.recipe.findMany({
        where: { authorId: userId },
        select: { id: true, name: true, slug: true },
    });

    const favoriteRecipes = await prisma.favorite.findMany({
        where: { userId },
        include: { recipe: { select: { id: true, name: true, slug: true } } },
    });

    // Az admin felhasználó a profiloldalon kap egy egyszerű userlistát is,
    // hogy látható legyen, kik férnek hozzá az admin által kezelt rendszerhez.
    const users = isAdminUser(currentUser)
        ? await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
            },
            orderBy: { username: "asc" },
        })
        : [];

    return NextResponse.json({
        ownRecipes,
        favoriteRecipes,
        users,
        currentUser: {
            id: currentUser.id,
            username: currentUser.username,
            role: currentUser.role,
        },
        canManageUsers: isAdminUser(currentUser),
    });
}
