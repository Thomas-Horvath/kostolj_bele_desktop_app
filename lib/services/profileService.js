import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { ADMIN_ROLE, sanitizeUserForSession } from "./authService.js";

export class ProfileServiceError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = "ProfileServiceError";
    this.status = status;
  }
}

function assertAuthenticatedUser(currentUser) {
  if (!currentUser?.id) {
    throw new ProfileServiceError("Nincs bejelentkezve", { status: 401 });
  }
}

function assertAdminUser(currentUser) {
  if (currentUser?.role !== ADMIN_ROLE) {
    throw new ProfileServiceError("Csak admin hozhat létre új felhasználót.", {
      status: 403,
    });
  }
}

function normalizeCreateUserPayload(payload = {}) {
  return {
    name: String(payload.name || "").trim(),
    username: String(payload.username || "").trim(),
    email: String(payload.email || "").trim().toLowerCase(),
    password: String(payload.password || ""),
  };
}

function validateCreateUserPayload(payload) {
  if (!payload.username || !payload.email || !payload.password) {
    throw new ProfileServiceError("Hiányzó adatok", { status: 400 });
  }
}

export async function getProfileData(currentUser) {
  assertAuthenticatedUser(currentUser);

  const userId = currentUser.id;

  // A profiloldalhoz egyben adjuk vissza a teljes dashboard adatcsomagot.
  // Így a renderernek nem kell külön lekéréseket indítania saját receptekre,
  // kedvencekre és admin userlistára.
  const ownRecipes = await prisma.recipe.findMany({
    where: { authorId: userId },
    select: { id: true, name: true, slug: true, imageURL: true },
    orderBy: { name: "asc" },
  });

  const favoriteRecipes = await prisma.favorite.findMany({
    where: { userId },
    include: { recipe: { select: { id: true, name: true, slug: true } } },
    orderBy: {
      recipe: {
        name: "asc",
      },
    },
  });

  const canManageUsers = currentUser.role === ADMIN_ROLE;
  const users = canManageUsers
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

  return {
    ownRecipes,
    favoriteRecipes,
    users,
    currentUser: {
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
    },
    canManageUsers,
  };
}

export async function createUserFromProfile(payload, currentUser) {
  assertAuthenticatedUser(currentUser);
  assertAdminUser(currentUser);

  const normalizedPayload = normalizeCreateUserPayload(payload);
  validateCreateUserPayload(normalizedPayload);

  // Mind az emailt, mind a felhasználónevet ellenőrizzük, hogy a UI
  // emberi hibaüzenetet kapjon, ne adatbázis unique constraint hibát.
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedPayload.email },
        { username: normalizedPayload.username },
      ],
    },
  });

  if (existingUser) {
    const duplicateField =
      existingUser.email === normalizedPayload.email ? "email" : "felhasználónév";

    throw new ProfileServiceError(`Ez a ${duplicateField} már foglalt.`, {
      status: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(normalizedPayload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: normalizedPayload.name || normalizedPayload.username,
      username: normalizedPayload.username,
      email: normalizedPayload.email,
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

  return {
    user: sanitizeUserForSession(user),
  };
}
