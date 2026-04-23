import authClient from "./authClient";

// Amig a regi Next API route-ok meg velunk elnek, a renderer minden vedett
// kereshez hozzaadja az aktualis desktop user azonositojat egy egyedi headerben.
//
// Ez atmeneti, de tudatos megoldas:
// - a next-auth azonnal kivezetheto
// - a regi /api route-ok tovabb tudnak mukodni
// - kesobb ugyanezek a helyek fokozatosan IPC hivasokra cserelhetok
export async function fetchWithDesktopAuth(input, init = {}) {
  const authState = await authClient.getCurrentUser();
  const headers = new Headers(init.headers || {});

  if (authState?.user?.id) {
    headers.set("x-desktop-user-id", authState.user.id);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
