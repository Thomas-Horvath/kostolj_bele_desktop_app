import fs from "fs/promises";
import path from "path";
import { getDesktopStorageLayout } from "./desktopStoragePaths.js";
import {
  JPEG_RECIPE_IMAGE_QUALITY,
  MAX_RECIPE_IMAGE_SIZE_BYTES,
  MAX_RECIPE_IMAGE_HEIGHT,
  MAX_RECIPE_IMAGE_WIDTH,
  MIME_TYPE_TO_EXTENSION,
  RECIPE_IMAGE_TYPE_LABEL,
  SUPPORTED_RECIPE_IMAGE_TYPES,
  WEBP_RECIPE_IMAGE_QUALITY,
} from "./recipeImageConfig.js";

function getCurrentDatePrefix() {
  return new Date().toISOString().split("T")[0];
}

export function getRecipeImagesDir() {
  const configuredDir = process.env.RECIPE_IMAGES_DIR?.trim();
  const targetDir =
    configuredDir || getDesktopStorageLayout().recipeImagesDir;

  // Desktop uzemmodban a cel az, hogy a kepek ne a projektmappaba,
  // hanem a felhasznalo sajat alkalmazas-adatmappajaba keruljenek.
  // Fejleszteshez meghagyjuk a felulbiralhatosagot env valtozoval.
  return path.isAbsolute(targetDir)
    ? targetDir
    : path.join(process.cwd(), targetDir);
}

export function getLegacyRecipeImagesDir() {
  // A korabban feltoltott kepek meg itt elhetnek.
  // Az atallas idejere fallbackkent meg megtartjuk ezt a helyet.
  return path.join(process.cwd(), "uploads", "recipe-images");
}

export function getRecipeImageContentType(imageURL) {
  const extension = path.extname(imageURL).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return "application/octet-stream";
}

export async function resolveRecipeImageFilePath(imageURL) {
  const candidateDirs = [getRecipeImagesDir(), getLegacyRecipeImagesDir()];

  for (const candidateDir of candidateDirs) {
    const candidatePath = path.join(candidateDir, imageURL);

    try {
      await fs.access(candidatePath);
      return candidatePath;
    } catch {
      // Itt szandekosan tovabb megyunk a kovetkezo lehetseges helyre.
      // Az atallas alatt lehetnek regi kepek a projekt uploads mappajaban,
      // mikozben az uj mentesek mar a desktop app userData ala kerulnek.
    }
  }

  return path.join(getRecipeImagesDir(), imageURL);
}

export function validateRecipeImageFile(file, { required = false } = {}) {
  if (!file || typeof file !== "object") {
    return required ? "Új recepthez kép feltöltése kötelező." : null;
  }

  if (!SUPPORTED_RECIPE_IMAGE_TYPES.includes(file.type)) {
    return `Csak ${RECIPE_IMAGE_TYPE_LABEL} formátumú képet tölthetsz fel.`;
  }

  if (typeof file.size === "number" && file.size > MAX_RECIPE_IMAGE_SIZE_BYTES) {
    return "A feltöltött kép túl nagy. A maximális méret 8 MB.";
  }

  return null;
}

function createFileName(slug, file) {
  const extension =
    MIME_TYPE_TO_EXTENSION[file.type] ||
    path.extname(file.name || "").toLowerCase() ||
    ".jpg";

  return `${getCurrentDatePrefix()}-${slug}${extension}`;
}

async function optimizeRecipeImageBuffer(file) {
  const bytes = await file.arrayBuffer();
  const sourceBuffer = Buffer.from(bytes);

  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default;

    let pipeline = sharp(sourceBuffer, { failOn: "none" }).rotate().resize({
      width: MAX_RECIPE_IMAGE_WIDTH,
      height: MAX_RECIPE_IMAGE_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    });

    if (file.type === "image/jpeg") {
      pipeline = pipeline.jpeg({
        quality: JPEG_RECIPE_IMAGE_QUALITY,
        mozjpeg: true,
      });
    } else if (file.type === "image/png") {
      pipeline = pipeline.png({
        compressionLevel: 9,
        palette: true,
      });
    } else if (file.type === "image/webp") {
      pipeline = pipeline.webp({
        quality: WEBP_RECIPE_IMAGE_QUALITY,
      });
    }

    return await pipeline.toBuffer();
  } catch (error) {
    console.warn("A kep optimalizalasa fallback modba valtott:", error);
    return sourceBuffer;
  }
}

export async function saveRecipeImage(file, slug) {
  const uploadDir = getRecipeImagesDir();
  await fs.mkdir(uploadDir, { recursive: true });

  const fileName = createFileName(slug, file);
  const filePath = path.join(uploadDir, fileName);
  const optimizedBuffer = await optimizeRecipeImageBuffer(file);

  // Az optimalizalas utan mar a desktopos kepmappaba irjuk ki a fajlt.
  // Ettol a telepitett alkalmazas nem a sajat programkonyvtaraba probal menteni.
  await fs.writeFile(filePath, optimizedBuffer);

  return fileName;
}

export async function deleteRecipeImage(imageURL) {
  if (!imageURL) {
    return;
  }

  const candidatePaths = [
    path.join(getRecipeImagesDir(), imageURL),
    path.join(getLegacyRecipeImagesDir(), imageURL),
  ];

  // Ket helyet is vizsgalunk:
  // 1. az uj desktopos userData kepmappat
  // 2. a regi projektbeli uploads mappat
  //
  // Ez biztosítja, hogy szerkesztesnel es torlesnel a regi kepek se maradjanak
  // ott arva fajlkent csak azert, mert meg az elozo tarolasi modellben jottek letre.
  for (const candidatePath of candidatePaths) {
    try {
      await fs.unlink(candidatePath);
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }
}
