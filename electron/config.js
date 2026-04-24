// Az Electron integacio kozponti konstansai egy helyen vannak osszegyujtve,
// hogy a main process, a preload es a kesobbi service retegek ugyanazokra az
// ertekekre tamaszkodjanak. Itt szandekosan csak stabil, ujrafelhasznalhato
// beallitasok vannak, uzleti logika nincs.

export const ELECTRON_APP_NAME = "Kostolj Bele";

// A desktopos receptkepekhez sajat protokollt vezetunk be. Ez megengedi, hogy
// kesobb a renderer ugy jelenitsen meg lokalis kepeket, mintha hagyomanyos URL
// lenne, de a fajlkezeles tovabbra is az Electron oldalon maradjon.
export const DESKTOP_IMAGE_PROTOCOL = "kb-image";

// Fejlesztes kozben egyelore a mar meglevo Next dev server adja a renderert.
// Ez csak atmeneti integracios lepes: a vegso cel az, hogy a renderer ne
// fuggjon a Next server backendes kepessegeitol.
export const DEFAULT_DEV_SERVER_URL = "http://localhost:3010";
