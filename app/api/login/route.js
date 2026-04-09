import { NextResponse } from "next/server";
import { validateCredentials } from "../../../lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await validateCredentials(body?.username, body?.password);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          field: result.field,
          message: result.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Nem sikerült ellenőrizni a bejelentkezési adatokat.",
      },
      { status: 500 }
    );
  }
}
