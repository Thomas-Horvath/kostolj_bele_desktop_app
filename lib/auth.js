import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Az admin jogosultságot most a role mező alapján döntjük el.
// Így később nem a felhasználónévhez kell kötni az engedélyeket.
export const ADMIN_ROLE = "ADMIN";

// A credentials ellenőrzést külön helperbe tettük, hogy ugyanaz a logika
// használható legyen a NextAuth authorize részében és a saját login API-ban is.
export async function validateCredentials(username, password) {
  const normalizedUsername = String(username || "").trim();
  const normalizedPassword = String(password || "");

  if (!normalizedUsername) {
    return {
      ok: false,
      field: "username",
      message: "A felhasználónév megadása kötelező.",
    };
  }

  if (!normalizedPassword) {
    return {
      ok: false,
      field: "password",
      message: "A jelszó megadása kötelező.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });

  if (!user) {
    return {
      ok: false,
      field: "username",
      message: "Nincs ilyen felhasználónév a rendszerben.",
    };
  }

  const isValid = await bcrypt.compare(normalizedPassword, user.password);
  if (!isValid) {
    return {
      ok: false,
      field: "password",
      message: "A megadott jelszó nem megfelelő.",
    };
  }

  return {
    ok: true,
    user,
  };
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Felhasználónév", type: "text" },
        password: { label: "Jelszó", type: "password" },
      },
      async authorize(credentials) {
        const result = await validateCredentials(
          credentials?.username,
          credentials?.password
        );

        if (!result.ok) {
          return null;
        }

        const { user } = result;

        // Ne add vissza a jelszót!
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    // Saját belépőoldalt használunk, ezért ide irányítjuk a NextAuthot is.
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Az Auth.js v5 a konfigurációból közvetlenül ad route handlereket és szerveres auth helpert.
// Így a korábbi getServerSession(authOptions) helyett mindenhol egységesen auth()-ot használhatunk.
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// A központi helperrel ugyanazt a szerepkör-ellenőrzést használjuk API-ban és UI-ban is.
export function isAdminUser(user) {
  return user?.role === ADMIN_ROLE;
}

// Az Auth.js különböző belépési pontokon kicsit eltérő session alakot adhat vissza.
// Ezzel a helperrel egy helyen normalizáljuk a user adatokat, hogy az API route-ok
// ne essenek el attól, ha a user mezők részben top-levelen érkeznek meg.
export function getSessionUser(session) {
  if (!session) return null;

  const nestedUser = session.user ?? null;
  const id = nestedUser?.id ?? session.id ?? session.sub ?? null;
  const username =
    nestedUser?.username ?? session.username ?? nestedUser?.name ?? session.name ?? null;
  const role = nestedUser?.role ?? session.role ?? "USER";
  const email = nestedUser?.email ?? session.email ?? null;
  const name = nestedUser?.name ?? session.name ?? username ?? null;

  if (!id) {
    return null;
  }

  return {
    id,
    username,
    role,
    email,
    name,
  };
}

// A szerveroldali API route-oknál előfordulhat, hogy az auth(req) ugyan ad vissza
// session objektumot, de a user mezők hiányosak. Ilyenkor a JWT sütiből is
// megpróbáljuk kiolvasni ugyanazt a user azonosítót, hogy az API és a kliens
// ugyanazt a bejelentkezett állapotot lássa.
export async function getRequestUser(req) {
  const session = await auth(req);
  const sessionUser = getSessionUser(session);

  if (sessionUser?.id) {
    return sessionUser;
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NEXTAUTH_URL?.startsWith("https://"),
  });

  return getSessionUser(token);
}
