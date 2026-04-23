import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";

export const ADMIN_ROLE = "ADMIN";

// A desktop authhoz nincs szukseg kulon Session vagy Account tablra.
// Eleg egy olyan User modell, amelyben benne van:
// - a belepeshez hasznalt azonosito
// - a hash-elt jelszo
// - a szerepkor
//
// Ez a helper mindenhol ugyanarra a "biztonsagosan tovabbadhato" user alakra
// hozza az adatot. A jelszo hash itt mar soha nem kerul vissza a renderer fele.
export function sanitizeUserForSession(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name || user.username,
    email: user.email,
    role: user.role || "USER",
  };
}

// A credentials ellenorzes kulon service-ben van, hogy ugyanazt a logikat
// hasznalhassuk Electron IPC-ben es atmenetileg a regi Next API retegnel is.
export async function validateCredentials(username, password) {
  const normalizedUsername = String(username || "").trim();
  const normalizedPassword = String(password || "");

  if (!normalizedUsername) {
    return {
      ok: false,
      field: "username",
      message: "A felhasznalonev megadasa kotelezo.",
    };
  }

  if (!normalizedPassword) {
    return {
      ok: false,
      field: "password",
      message: "A jelszo megadasa kotelezo.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });

  if (!user) {
    return {
      ok: false,
      field: "username",
      message: "Nincs ilyen felhasznalonev a rendszerben.",
    };
  }

  const isValid = await bcrypt.compare(normalizedPassword, user.password);

  if (!isValid) {
    return {
      ok: false,
      field: "password",
      message: "A megadott jelszo nem megfelelo.",
    };
  }

  return {
    ok: true,
    user: sanitizeUserForSession(user),
  };
}

// A desktop authnal az IPC login valojaban ezt a service-t fogja hivni.
// Itt mar ugyanazt az alakot adjuk vissza, amit a sessionStore is el tud menteni.
export async function loginWithCredentials(credentials) {
  const result = await validateCredentials(
    credentials?.username,
    credentials?.password
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    user: result.user,
  };
}

// A regi /api route-ok atmenetileg meg maradnak, de a usert mar nem NextAuth
// sessionbol, hanem a desktop renderer altal kuldott user azonosito alapjan
// kerjuk ki az adatbazisbol.
export async function getSessionUserById(userId) {
  const normalizedUserId = String(userId || "").trim();

  if (!normalizedUserId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: normalizedUserId },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return sanitizeUserForSession(user);
}
