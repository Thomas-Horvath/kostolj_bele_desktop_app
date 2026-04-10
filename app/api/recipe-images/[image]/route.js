import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  getRecipeImageContentType,
  getRecipeImageFilePath,
} from "../../../../lib/recipeImageStorage";

export const runtime = "nodejs";

function sanitizeImageName(imageName) {
  const decoded = decodeURIComponent(imageName || "");
  const normalized = path.basename(decoded);

  return normalized === decoded ? normalized : "";
}

export async function GET(_req, { params }) {
  try {
    const resolvedParams = await params;
    const imageName = sanitizeImageName(resolvedParams.image);

    if (!imageName) {
      return NextResponse.json({ error: "Ervénytelen képnév." }, { status: 400 });
    }

    const filePath = getRecipeImageFilePath(imageName);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": getRecipeImageContentType(imageName),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return NextResponse.json({ error: "A kép nem található." }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ error: "Hiba történt a kép kiszolgálásakor." }, { status: 500 });
  }
}
