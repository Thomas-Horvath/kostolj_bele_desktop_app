import fs from "node:fs/promises";
import path from "node:path";

/*
  DESKTOP SMOKE TESZT

  Ezt a fajlt nem sima `node` futtatja, hanem az Electron:

    npm run test:desktop

  Miert fontos ez?
  - A projektben a Prisma SQLite adaptere natív `better-sqlite3` modult hasznal.
  - Fejlesztes kozben ezt most Electron runtime-hoz forditjuk.
  - Emiatt a service reteget akkor tudjuk hitelesen tesztelni, ha ugyanabban
    a runtime-ban fut, ahol az Electron IPC is hasznalni fogja.

  Mit probal vegig?
  - bejelentkezes
  - receptlista es kategoriak
  - recept letrehozas keppel
  - recept lekeres slug alapjan
  - rating mentese
  - kedvenc kapcsolasa
  - profil dashboard lekerese
  - admin user letrehozas
  - recept frissites kepcserével
  - recept torles kep torlessel

  A teszt sajat, egyedi adatokat hoz letre, majd a vegen feltakarit.
*/

const projectRoot = process.cwd();
const testImagesDir = path.join(projectRoot, "tmp", "desktop-smoke-images");

// A kepeket teszt kozben nem a valodi desktop userData mappaba mentjuk,
// hanem egy projektbeli ideiglenes mappaba. Igy egyszerubb ellenorizni,
// hogy a create/update/delete tenyleg kezeli-e a kepfajlokat.
process.env.RECIPE_IMAGES_DIR = testImagesDir;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`TESZT HIBA: ${message}`);
  }
}

function logStep(message) {
  console.log(`✓ ${message}`);
}

function createPngTestFile(name) {
  // 1x1 pixeles atlatszo PNG. Kicsi, gyors, de valodi kepfajl.
  const buffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64"
  );

  return {
    name,
    type: "image/png",
    size: buffer.length,
    buffer,
  };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function runDesktopSmokeTest() {
  await fs.rm(testImagesDir, { recursive: true, force: true });
  await fs.mkdir(testImagesDir, { recursive: true });

  // A service importok szandekosan a RECIPE_IMAGES_DIR beallitasa utan tortennek.
  // Igy a kepmento helper mar a tesztmappat fogja hasznalni.
  const { loginWithCredentials } = await import("../lib/services/authService.js");
  const {
    createRecipe,
    deleteRecipe,
    getRecipeBySlug,
    listRecipes,
    listRecipeTypes,
    updateRecipe,
  } = await import("../lib/services/recipeService.js");
  const {
    createUserFromProfile,
    getProfileData,
  } = await import("../lib/services/profileService.js");
  const {
    listFavoriteRecipeIds,
    toggleFavoriteRecipe,
  } = await import("../lib/services/favoriteService.js");
  const { saveRecipeRating } = await import("../lib/services/ratingService.js");
  const { prisma } = await import("../lib/prisma.js");

  const uniqueSuffix = Date.now();
  const recipeName = `Desktop Smoke Teszt ${uniqueSuffix}`;
  const updatedRecipeName = `Desktop Smoke Teszt Frissitve ${uniqueSuffix}`;
  const testUsername = `desktop_smoke_${uniqueSuffix}`;
  const testEmail = `${testUsername}@example.com`;

  let createdRecipe = null;
  let createdUser = null;

  try {
    const loginResult = await loginWithCredentials({
      username: "Tamás",
      password: "Password",
    });

    assert(loginResult.ok, "Az admin bejelentkezes nem sikerult.");
    assert(loginResult.user?.role === "ADMIN", "A teszt admin usert var.");
    const adminUser = loginResult.user;
    logStep("bejelentkezes sikeres");

    const types = await listRecipeTypes();
    assert(types.length > 0, "Nincs egyetlen receptkategoria sem.");
    const selectedType = types[0];
    const selectedSubtype = selectedType.subtypes?.[0] || null;
    logStep("kategoriak betoltve");

    const basePayload = {
      name: recipeName,
      note: "Automata desktop smoke teszt recept.",
      typeParamName: selectedType.paramName,
      subtypeParamName: selectedSubtype?.paramName || "",
      ingredients: JSON.stringify([
        {
          name: "teszt hozzavalo",
          amount: "1",
          unit: "db",
        },
      ]),
      steps: JSON.stringify([
        {
          content: "Teszt lepes.",
          timer: 1,
        },
      ]),
      file: createPngTestFile("desktop-smoke-create.png"),
    };

    createdRecipe = await createRecipe(basePayload, adminUser);
    assert(createdRecipe.id, "A recept letrehozasa nem adott ID-t.");
    assert(createdRecipe.imageURL, "A recepthez nem mentodott kepnev.");
    const firstImagePath = path.join(testImagesDir, createdRecipe.imageURL);
    assert(await fileExists(firstImagePath), "A letrehozott recept kepe nem jott letre.");
    logStep("recept letrehozva keppel");

    const recipes = await listRecipes("Desktop Smoke");
    assert(
      recipes.some((recipe) => recipe.id === createdRecipe.id),
      "A letrehozott recept nem jelent meg a listaban."
    );
    logStep("receptlista mukodik");

    const recipeBySlug = await getRecipeBySlug(createdRecipe.slug);
    assert(recipeBySlug?.id === createdRecipe.id, "A slug alapu lekeres hibas.");
    logStep("recept reszletezo adatlekeres mukodik");

    const ratingResult = await saveRecipeRating(
      { recipeId: createdRecipe.id, score: 4.5 },
      adminUser
    );
    assert(ratingResult.average === 4.5, "A rating atlag nem frissult.");
    logStep("rating mentese mukodik");

    const favoriteOn = await toggleFavoriteRecipe(createdRecipe.id, adminUser);
    assert(favoriteOn.favorited, "A kedvenc bekapcsolasa nem sikerult.");
    const favoriteIds = await listFavoriteRecipeIds(adminUser);
    assert(
      favoriteIds.includes(createdRecipe.id),
      "A kedvenc lista nem tartalmazza a receptet."
    );
    const favoriteOff = await toggleFavoriteRecipe(createdRecipe.id, adminUser);
    assert(!favoriteOff.favorited, "A kedvenc kikapcsolasa nem sikerult.");
    logStep("kedvenc kapcsolas mukodik");

    const profileData = await getProfileData(adminUser);
    assert(profileData.canManageUsers, "Az admin profil nem kapott userkezelesi jogot.");
    assert(
      profileData.ownRecipes.some((recipe) => recipe.id === createdRecipe.id),
      "A profil sajat recept listaja nem tartalmazza az uj receptet."
    );
    logStep("profil dashboard adatlekeres mukodik");

    const userCreateResult = await createUserFromProfile(
      {
        name: "Desktop Smoke User",
        username: testUsername,
        email: testEmail,
        password: "Password123",
      },
      adminUser
    );
    createdUser = userCreateResult.user;
    assert(createdUser?.id, "Az admin user letrehozas nem adott user ID-t.");
    logStep("admin user letrehozas mukodik");

    const updatePayload = {
      ...basePayload,
      name: updatedRecipeName,
      note: "Automata desktop smoke teszt recept frissitve.",
      file: createPngTestFile("desktop-smoke-update.png"),
    };

    const updatedRecipe = await updateRecipe(
      createdRecipe.id,
      updatePayload,
      adminUser
    );
    assert(
      updatedRecipe.name === updatedRecipeName,
      "A recept neve nem frissult."
    );
    assert(
      updatedRecipe.imageURL !== createdRecipe.imageURL,
      "Kepcsere utan ugyanaz maradt a kepnev."
    );
    assert(
      !(await fileExists(firstImagePath)),
      "Kepcsere utan a regi kepfajl nem torlodott."
    );
    const secondImagePath = path.join(testImagesDir, updatedRecipe.imageURL);
    assert(await fileExists(secondImagePath), "A frissitett recept uj kepe nem jott letre.");
    logStep("recept frissites es kepcsere mukodik");

    await deleteRecipe(createdRecipe.id, adminUser);
    assert(
      !(await fileExists(secondImagePath)),
      "Recept torles utan a kepfajl nem torlodott."
    );
    const deletedRecipe = await getRecipeBySlug(updatedRecipe.slug);
    assert(!deletedRecipe, "A recept torles utan meg mindig lekerheto.");
    createdRecipe = null;
    logStep("recept torles es keptorles mukodik");

    console.log("\nMinden desktop smoke teszt sikeresen lefutott.");
  } finally {
    // A finally blokk akkor is takarit, ha egy koztes assert elhasal.
    // Igy kisebb esellyel marad tesztadat az adatbazisban.
    if (createdRecipe?.id) {
      await prisma.recipe.deleteMany({
        where: { id: createdRecipe.id },
      });
    }

    if (createdUser?.id) {
      await prisma.user.deleteMany({
        where: { id: createdUser.id },
      });
    }

    await fs.rm(testImagesDir, { recursive: true, force: true });
    await prisma.$disconnect();
  }
}

runDesktopSmokeTest()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDesktop smoke teszt sikertelen:");
    console.error(error);
    process.exit(1);
  });
