const DESKTOP_IMAGE_PROTOCOL = "kb-image";

function normalizeRecipeImageName(imageURL) {
  // A regi webes korszakbol maradhat olyan adat, ami nem csak fajlnev,
  // hanem peldaul `/uploads/recipe-images/kep.jpg` vagy `/api/.../kep.jpg`.
  // Desktopon a kepet nev alapjan kerjuk az Electron main processtol, ezert
  // itt mindig csak az utolso utvonalszegmensre van szuksegunk.
  return String(imageURL || "")
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .at(-1);
}

export function getRecipeImageSrc(imageURL) {
  const imageName = normalizeRecipeImageName(imageURL);

  if (!imageName) {
    return "/banner6.webp";
  }

  // Desktop appban a receptkepeket nem Next API route-on keresztul kerjuk le,
  // hanem az Electron main process altal regisztralt sajat protokollon.
  //
  // A main process ezt a formatumot kezeli:
  //   kb-image://kepnev.jpg
  //
  // Igy a renderer egy URL-t kap, de a fajlrendszerhez tovabbra is csak
  // az Electron backend fer hozza.
  return `${DESKTOP_IMAGE_PROTOCOL}://${encodeURIComponent(imageName)}`;
}
