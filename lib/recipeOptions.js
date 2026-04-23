import slugify from "../utilities/slugify.js";

// A kategóriákat egy közös forrásból kezeljük, hogy a seed, a sidebar és a form
// mindig ugyanazt a listát használja, és ne csússzanak szét a hardcode-olt értékek.
export const CATEGORY_DEFINITIONS = [
  {
    name: "Egytálételek",
    paramName: "egytaletelek",
    subtypes: [
      { name: "Rakott ételek", paramName: "rakott-etelek", keywords: ["rakott", "csoben", "gratin"] },
      { name: "Rizses egytálak", paramName: "rizses-egytalak", keywords: ["rizs", "rizses", "rizotto"] },
      { name: "Krumplis egytálak", paramName: "krumplis-egytalak", keywords: ["krumpli", "burgonya"] },
      { name: "Szaftos egytálak", paramName: "szaftos-egytalak", keywords: ["paprikas", "ragu", "porkolt"] },
    ],
  },
  {
    name: "Desszertek",
    paramName: "desszertek",
    subtypes: [
      { name: "Sütemények", paramName: "sutemenyek", keywords: ["pite", "suti", "keksz", "brownie"] },
      { name: "Torták", paramName: "tortak", keywords: ["torta"] },
      { name: "Krémes desszertek", paramName: "kremes-desszertek", keywords: ["puding", "mousse", "krém", "tiramisu"] },
      { name: "Palacsinták", paramName: "palacsintak", keywords: ["palacsinta", "gofri"] },
    ],
  },
  {
    name: "Halételek",
    paramName: "haletelek",
    subtypes: [
      { name: "Édesvízi halak", paramName: "edesvizi-halak", keywords: ["ponty", "harcsa", "pisztrang"] },
      { name: "Tengeri halak", paramName: "tengeri-halak", keywords: ["lazac", "tonhal", "tokehal", "hekk"] },
      { name: "Rántott halak", paramName: "rantott-halak", keywords: ["rantott", "bundazott"] },
    ],
  },
  {
    name: "Húsételek",
    paramName: "husetelek",
    subtypes: [
      { name: "Csirke", paramName: "csirke", keywords: ["csirke", "csirkemell", "csirkecomb", "szarnyas"] },
      { name: "Sertés", paramName: "sertes", keywords: ["sertes", "sertescomb", "serteskaraj", "karaj", "tarja"] },
      { name: "Marha", paramName: "marha", keywords: ["marha", "marhahus", "marhalapocka", "marhaszinhus"] },
      { name: "Pulyka", paramName: "pulyka", keywords: ["pulyka", "pulykamell", "pulykacomb"] },
    ],
  },
  {
    name: "Levesek",
    paramName: "levesek",
    subtypes: [
      { name: "Húslevesek", paramName: "huslevesek", keywords: ["husleves", "gulyas", "becsi"] },
      { name: "Krémlevesek", paramName: "kremlevesek", keywords: ["kremleves"] },
      { name: "Ragulevesek", paramName: "ragulevesek", keywords: ["raguleves"] },
      { name: "Gyümölcslevesek", paramName: "gyumolcslevesek", keywords: ["gyumolcsleves", "meggy", "eper"] },
    ],
  },
  {
    name: "Főzelékek",
    paramName: "fozelekek",
    subtypes: [
      { name: "Zöldségfőzelékek", paramName: "zoldsegfozelekek", keywords: ["tok", "spenot", "soska", "kaposzta"] },
      { name: "Hüvelyes főzelékek", paramName: "huvelyes-fozelekek", keywords: ["borso", "bab", "lencse", "sargabors"] },
      { name: "Burgonyás főzelékek", paramName: "burgonyas-fozelekek", keywords: ["krumpli", "burgonya"] },
    ],
  },
  {
    name: "Italok",
    paramName: "italok",
    subtypes: [
      { name: "Hideg italok", paramName: "hideg-italok", keywords: ["limonade", "jeges", "hutes"] },
      { name: "Meleg italok", paramName: "meleg-italok", keywords: ["tea", "kakao", "forro"] },
      { name: "Turmixok", paramName: "turmixok", keywords: ["turmix", "smoothie", "shake"] },
    ],
  },
  {
    name: "Köretek",
    paramName: "koretek",
    subtypes: [
      { name: "Rizses köretek", paramName: "rizses-koretek", keywords: ["rizs", "rizotto"] },
      { name: "Burgonyás köretek", paramName: "burgonyas-koretek", keywords: ["krumpli", "burgonya", "hasabburgonya"] },
      { name: "Zöldséges köretek", paramName: "zoldseges-koretek", keywords: ["zoldseg", "karfiol", "brokkoli"] },
      { name: "Tésztás köretek", paramName: "tesztas-koretek", keywords: ["tészta", "lasagne", "spagetti"] },
    ],
  },
  {
    name: "Saláták",
    paramName: "salatak",
    subtypes: [
      { name: "Zöldsaláták", paramName: "zoldsalatak", keywords: ["salata", "jegsalata", "rukola"] },
      { name: "Tésztasaláták", paramName: "tesztasalatak", keywords: ["teszta", "fusilli", "penne"] },
      { name: "Majonézes saláták", paramName: "majonezes-salatak", keywords: ["majonez", "majonéz", "francia"] },
    ],
  },
  {
    name: "Tészták",
    paramName: "tesztak",
    subtypes: [
      { name: "Sült tészták", paramName: "sult-tesztak", keywords: ["lasagne", "csoben", "sutoben"] },
      { name: "Főtt tészták", paramName: "fott-tesztak", keywords: ["spagetti", "penne", "fusilli", "makaroni"] },
      { name: "Töltött tészták", paramName: "toltott-tesztak", keywords: ["toltott", "ravioli", "cannelloni"] },
    ],
  },
  {
    name: "Vegetáriánus ételek",
    paramName: "vegetarianus-etelek",
    subtypes: [
      { name: "Vegán fogások", paramName: "vegan-fogasok", keywords: ["vegan", "tofu", "novenyi"] },
      { name: "Sajtos fogások", paramName: "sajtos-fogasok", keywords: ["sajt", "mozzarella", "trappista"] },
      { name: "Zöldséges főételek", paramName: "zoldseges-foetelek", keywords: ["cukkini", "padlizsan", "brokkoli", "karfiol"] },
    ],
  },
  {
    name: "Egyéb",
    paramName: "egyeb",
    subtypes: [
      { name: "Reggelik", paramName: "reggelik", keywords: ["reggeli", "zabkasa", "omlett"] },
      { name: "Szendvicsek", paramName: "szendvicsek", keywords: ["szendvics", "burger", "bagett"] },
      { name: "Szószok és krémek", paramName: "szoszok-es-kremek", keywords: ["szosz", "krem", "dip", "pesto"] },
    ],
  },
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

const SUBTYPE_ORDER = new Map(
  CATEGORY_DEFINITIONS.flatMap((category) =>
    (category.subtypes || []).map((subtype, index) => [
      `${category.paramName}:${subtype.paramName}`,
      index,
    ])
  )
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

export function sortSubtypesByPreferredOrder(categoryParamName, subtypes) {
  return [...subtypes].sort((a, b) => {
    const aIndex = SUBTYPE_ORDER.get(`${categoryParamName}:${a.paramName}`) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = SUBTYPE_ORDER.get(`${categoryParamName}:${b.paramName}`) ?? Number.MAX_SAFE_INTEGER;

    if (aIndex === bIndex) {
      return a.name.localeCompare(b.name, "hu");
    }

    return aIndex - bIndex;
  });
}

export function getCategoryDefinition(categoryParamName) {
  return CATEGORY_DEFINITIONS.find((category) => category.paramName === categoryParamName) || null;
}

export function getCategorySubtypes(categoryParamName) {
  return getCategoryDefinition(categoryParamName)?.subtypes || [];
}

export function findSubtypeDefinition(categoryParamName, subtypeParamName) {
  return (
    getCategorySubtypes(categoryParamName).find(
      (subtype) => subtype.paramName === subtypeParamName
    ) || null
  );
}

function normalizeRecipeFilterText(value) {
  return slugify(String(value || "").trim().toLowerCase());
}

function collectRecipeSearchText(recipe) {
  const haystack = [
    recipe?.name,
    recipe?.slug,
    recipe?.note,
    ...(Array.isArray(recipe?.ingredients)
      ? recipe.ingredients.flatMap((ingredient) => [
          ingredient?.name,
          ingredient?.amount,
          ingredient?.unit,
        ])
      : []),
  ]
    .map(normalizeRecipeFilterText)
    .filter(Boolean)
    .join(" ");
  return haystack;
}

function matchSubtypeByKeywords(recipe, subtypes) {
  const haystack = collectRecipeSearchText(recipe);

  for (const subtype of subtypes) {
    const keywords = Array.isArray(subtype.keywords) ? subtype.keywords : [];
    const matched = keywords.some((keyword) =>
      haystack.includes(normalizeRecipeFilterText(keyword))
    );

    if (matched) {
      return subtype;
    }
  }

  return null;
}

export function resolveSeedSubtype(recipe, categoryParamName) {
  const subtypes = getCategorySubtypes(categoryParamName);
  if (!subtypes.length) {
    return null;
  }

  return matchSubtypeByKeywords(recipe, subtypes)?.paramName || subtypes[0].paramName;
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
