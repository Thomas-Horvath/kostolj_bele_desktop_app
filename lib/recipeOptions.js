import slugify from "../utilities/slugify.js";

// A kategóriákat egy közös forrásból kezeljük, hogy a seed, a sidebar és a form
// mindig ugyanazt a listát használja, és ne csússzanak szét a hardcode-olt értékek.
export const CATEGORY_DEFINITIONS = [
  { name: "Egytálételek", paramName: "egytaletelek" },
  { name: "Desszertek", paramName: "desszertek" },
  { name: "Halételek", paramName: "haletelek" },
  { name: "Húsételek", paramName: "husetelek" },
  { name: "Levesek", paramName: "levesek" },
  { name: "Főzelékek", paramName: "fozelekek" },
  { name: "Italok", paramName: "italok" },
  { name: "Köretek", paramName: "koretek" },
  { name: "Saláták", paramName: "salatak" },
  { name: "Tészták", paramName: "tesztak" },
  { name: "Vegetáriánus ételek", paramName: "vegetarianus-etelek" },
  { name: "Egyéb", paramName: "egyeb" },
];

export const MEASUREMENT_UNITS = [
  { value: "db", label: "db" },
  { value: "dkg", label: "dkg" },
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "dl", label: "dl" },
  { value: "l", label: "l" },
  { value: "ek", label: "evőkanál" },
  { value: "tk", label: "teáskanál" },
  { value: "csipet", label: "csipet" },
  { value: "csomag", label: "csomag" },
  { value: "gerezd", label: "gerezd" },
  { value: "fej", label: "fej" },
  { value: "szelet", label: "szelet" },
  { value: "bögre", label: "bögre" },
  { value: "csésze", label: "csésze" },
  { value: "font", label: "font" },
  { value: "kvart", label: "kvart" },
];

export const INGREDIENT_SUGGESTIONS = [
  "víz",
  "tej",
  "tejszín",
  "tejföl",
  "vaj",
  "margarin",
  "olívaolaj",
  "napraforgóolaj",
  "liszt",
  "rétesliszt",
  "zabpehely",
  "rizs",
  "bulgur",
  "kuszkusz",
  "tészta",
  "krumpli",
  "burgonya",
  "édesburgonya",
  "vöröshagyma",
  "lilahagyma",
  "újhagyma",
  "fokhagyma",
  "sárgarépa",
  "fehérrépa",
  "zeller",
  "karalábé",
  "karfiol",
  "brokkoli",
  "cukkini",
  "padlizsán",
  "paradicsom",
  "paradicsompüré",
  "paprika",
  "tv paprika",
  "csilipaprika",
  "uborka",
  "saláta",
  "jégsaláta",
  "káposzta",
  "savanyú káposzta",
  "spenót",
  "lencse",
  "bab",
  "sárgaborsó",
  "gomba",
  "kukorica",
  "borsó",
  "alma",
  "körte",
  "citrom",
  "narancs",
  "banán",
  "eper",
  "áfonya",
  "meggy",
  "tojás",
  "cukor",
  "porcukor",
  "barna cukor",
  "méz",
  "só",
  "bors",
  "pirospaprika",
  "fahéj",
  "oregánó",
  "bazsalikom",
  "petrezselyem",
  "kapor",
  "majoránna",
  "kömény",
  "sütőpor",
  "szódabikarbóna",
  "élesztő",
  "citromlé",
  "mustár",
  "majonéz",
  "ketchup",
  "sajt",
  "trappista sajt",
  "mozzarella",
  "túró",
  "joghurt",
  "csirkemell",
  "csirkecomb",
  "sertéscomb",
  "sertéskaraj",
  "darálthús",
  "marhahús",
  "halfilé",
  "lazac",
];

const CATEGORY_ORDER = new Map(
  CATEGORY_DEFINITIONS.map((category, index) => [category.paramName, index])
);

const UNIT_LABELS = new Map(
  MEASUREMENT_UNITS.map((unit) => [unit.value, unit.label])
);

const UNIT_ALIASES = new Map([
  ["db", "db"],
  ["darab", "db"],
  ["dkg", "dkg"],
  ["dekagramm", "dkg"],
  ["deka", "dkg"],
  ["kg", "kg"],
  ["kiló", "kg"],
  ["kilogramm", "kg"],
  ["g", "g"],
  ["gramm", "g"],
  ["ml", "ml"],
  ["milliliter", "ml"],
  ["dl", "dl"],
  ["deciliter", "dl"],
  ["l", "l"],
  ["liter", "l"],
  ["ek", "ek"],
  ["evőkanál", "ek"],
  ["evokanal", "ek"],
  ["tk", "tk"],
  ["teáskanál", "tk"],
  ["teaskanal", "tk"],
  ["csipet", "csipet"],
  ["csomag", "csomag"],
  ["gerezd", "gerezd"],
  ["fej", "fej"],
  ["szelet", "szelet"],
  ["bögre", "bögre"],
  ["bogre", "bögre"],
  ["csésze", "csésze"],
  ["csesze", "csésze"],
  ["font", "font"],
  ["kvart", "kvart"],
]);

export function sortTypesByPreferredOrder(types) {
  return [...types].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.get(a.paramName) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = CATEGORY_ORDER.get(b.paramName) ?? Number.MAX_SAFE_INTEGER;

    if (aIndex === bIndex) {
      return a.name.localeCompare(b.name, "hu");
    }

    return aIndex - bIndex;
  });
}

export function formatIngredientQuantity(ingredient) {
  const amount = String(ingredient?.amount || "").trim();
  const unit = canonicalizeMeasurementUnit(ingredient?.unit);

  if (!amount && !unit) {
    return "";
  }

  const label = UNIT_LABELS.get(unit) || unit;
  return [amount, label].filter(Boolean).join(" ");
}

// A mértékegységeket mindig a select értékeire normalizáljuk.
// Így a seed, a szerkesztőoldal és a kézi mentés ugyanazzal a rövid belső kóddal dolgozik.
export function canonicalizeMeasurementUnit(unit) {
  const normalized = String(unit || "").trim().toLowerCase();
  return UNIT_ALIASES.get(normalized) || normalized;
}

// A seedben még egy régi JSON forrást használunk. Ezt átalakítjuk az új
// amount + unit párosításra, hogy ne kelljen kézzel újraírogatni a komplett mintalistát.
export function splitLegacyQuantity(quantity) {
  const normalized = String(quantity || "").trim();

  if (!normalized) {
    return { amount: "", unit: "" };
  }

  const compactMatch = normalized.match(/^([\d\s.,/-]+)([^\d].*)$/u);
  if (compactMatch) {
    return {
      amount: compactMatch[1].trim(),
      unit: canonicalizeMeasurementUnit(compactMatch[2].trim()),
    };
  }

  const spacedMatch = normalized.match(/^(.+?)\s+(.+)$/u);
  if (spacedMatch) {
    return {
      amount: spacedMatch[1].trim(),
      unit: canonicalizeMeasurementUnit(spacedMatch[2].trim()),
    };
  }

  return {
    amount: normalized,
    unit: "db",
  };
}

export function normalizeSeedIngredient(ingredient) {
  if ("amount" in ingredient || "unit" in ingredient) {
    const normalizedUnit = canonicalizeMeasurementUnit(ingredient.unit);
    return {
      name: String(ingredient.name || "").trim(),
      amount: String(ingredient.amount || "").trim(),
      unit: normalizedUnit || "db",
    };
  }

  const { amount, unit } = splitLegacyQuantity(ingredient.quantity);
  return {
    name: String(ingredient.name || "").trim(),
    amount,
    unit,
  };
}

// A meglévő mintareceptek régi kategóriaazonosítókkal készültek.
// Itt egyszerű, emberi logikával hozzárendeljük őket az új, valósabb listához.
export function resolveSeedCategory(recipe) {
  const slug = String(recipe.slug || "");
  const name = String(recipe.name || "");
  const text = `${slug} ${name}`.toLowerCase();

  if (text.includes("leves")) return "levesek";
  if (text.includes("salata")) return "salatak";
  if (text.includes("pizza") || text.includes("teszta") || text.includes("puds")) return "tesztak";
  if (text.includes("suti") || text.includes("torta") || text.includes("desszert")) return "desszertek";
  if (text.includes("lencse") || text.includes("sparga") || text.includes("tok")) return "vegetarianus-etelek";

  switch (recipe.type) {
    case 1:
    case 2:
      return "husetelek";
    case 3:
      return "vegetarianus-etelek";
    case 4:
      return "desszertek";
    case 5:
      return "levesek";
    case 6:
      return "egyeb";
    default:
      return slugify(name) || "egyeb";
  }
}
