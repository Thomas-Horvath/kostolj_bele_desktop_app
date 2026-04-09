import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { getRequestUser, isAdminUser } from "../../../lib/auth";

export async function POST(req) {
  try {
    // Új felhasználót csak bejelentkezett admin hozhat létre.
    // Ezzel megszűnik a publikus regisztráció, és a profiloldalról marad kezelhető a userlista.
    const currentUser = await getRequestUser(req);
    if (!isAdminUser(currentUser)) {
      return NextResponse.json(
        { error: "Csak admin hozhat létre új felhasználót." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, username, email, password } = body;

    // A minimális validációt a szerveren is elvégezzük, nem csak a formban.
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Hiányzó adatok" }, { status: 400 });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Mind az emailt, mind a felhasználónevet ellenőrizzük,
    // hogy ne adatbázis-hibából derüljön ki az ütközés.
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername },
        ],
      },
    });

    if (existingUser) {
      const duplicateField =
        existingUser.email === normalizedEmail ? "email" : "felhasználónév";

      return NextResponse.json(
        { error: `Ez a ${duplicateField} már foglalt.` },
        { status: 400 }
      );
    }

    // A jelszót mindig hash-elve tároljuk.
    const hashedPassword = await bcrypt.hash(password, 10);

    // A projekt kérése alapján az újonnan létrehozott felhasználók normál userek.
    const user = await prisma.user.create({
      data: {
        name: name?.trim() || normalizedUsername,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Regisztrációs hiba:", error);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}
