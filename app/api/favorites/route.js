import { getRequestUser } from "../../../lib/auth"; 
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const currentUser = await getRequestUser(request);

  if (!currentUser?.id) {
    return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
  }

  const userId = currentUser.id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { recipeId: true },
  });

  return NextResponse.json(favorites.map(fav => fav.recipeId), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}




export async function POST(request) {
  const currentUser = await getRequestUser(request);

  if (!currentUser?.id) {
    return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
  }

  const userId = currentUser.id;
  const { recipeId } = await request.json();

  const exists = await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId: userId, recipeId: recipeId } },
  });

  if (exists) {
    await prisma.favorite.delete({
      where: { userId_recipeId: { userId: userId, recipeId: recipeId } },
    });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({
      data: { userId: userId, recipeId: recipeId },
    });
    return NextResponse.json({ favorited: true });
  }
};
