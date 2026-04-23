import {
  ADMIN_ROLE,
  getSessionUserById,
  validateCredentials,
} from "./services/authService.js";

export { ADMIN_ROLE, validateCredentials };

// A regi Next API route-ok atmenetileg meg velunk maradnak, de a next-auth
// teljesen kikerul a projektbol. Emiatt a route-ok mar nem session cookie-bol,
// hanem a renderer altal kuldott desktop user azonosito alapjan oldjak fel a
// bejelentkezett usert.
export async function getRequestUser(req) {
  const userId = req?.headers?.get("x-desktop-user-id");

  if (!userId) {
    return null;
  }

  return getSessionUserById(userId);
}

// A szerepkor-ellenorzes ugyanugy kozponti helper marad, csak mar nincs a
// webes auth csomaghoz kotve.
export function isAdminUser(user) {
  return user?.role === ADMIN_ROLE;
}
