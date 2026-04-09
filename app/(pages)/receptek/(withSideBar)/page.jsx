// NINCS "use client" itt!
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // ne próbálja SSG-kor futtatni

import RecipesClient from "./RecipesClient";
export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  // A query stringet a szerveroldali page átadja a kliens komponensnek,
  // így az ugyanabból a forrásból tud listát és keresési állapotot felépíteni.
  return <RecipesClient initialQuery={resolvedSearchParams?.q || ""} />;
}
