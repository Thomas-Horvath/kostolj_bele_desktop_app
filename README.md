# Kóstolj Bele! Desktop App

Ez a projekt a már létező **Kóstolj Bele!** receptes weboldal desktop alkalmazássá alakított változata.

Az átalakítás célja, hogy az alkalmazás ne nyilvános weboldalként működjön, hanem privát, helyben futó Windows desktop appként. A személyes cél az, hogy a feleségem saját receptgyűjteményként, kényelmesen és webes publikálás nélkül tudja használni.

## Röviden

- Next.js alapú React felület
- Electron desktop alkalmazáskeret
- Prisma ORM 7
- SQLite adatbázis
- saját desktop autentikáció
- helyi receptképek kezelése
- Next API route-ok nélkül, Electron IPC + service rétegen keresztül

## Mit tud az app?

- receptek létrehozása, szerkesztése és törlése
- receptképek mentése, cseréje és törlése
- kategória alapú böngészés
- receptkeresés
- kedvencek kezelése
- receptértékelés
- profil oldal
- admin alapú felhasználókezelés
- bejelentkezett felhasználó megjegyzése desktop sessionben

## Miért desktop app?

Az eredeti app weboldalként készült, de ennél a verziónál a cél már nem a publikus elérés vagy hosting.

A desktop verzió előnyei:

- privát használatra alkalmasabb
- nem kell publikus szerver
- az adatbázis és a képek helyben kezelhetők
- egyszerűbb autentikáció elég
- alkalmazásszerűbb felhasználói élmény adható

## Technológiai stack

- Next.js `15.5`
- React `19`
- Electron `41`
- Prisma ORM `7`
- SQLite
- `better-sqlite3`
- Sass moduláris stílusok

## Architektúra

A projektben a régi Next backend API route-ok ki lettek vezetve.

Az új desktop adatfolyam:

```text
React UI
  -> lib/renderer/api kliens
  -> Electron preload
  -> Electron IPC
  -> lib/services
  -> Prisma
  -> SQLite
```

Ez azt jelenti, hogy a React felület nem közvetlenül adatbázist hív, és már nem `/api/...` útvonalakon keresztül kommunikál. A backend jellegű feladatok az Electron main process és a service réteg mögé kerültek.

## Fontos mappák

- `app/`: Next.js App Router felület és React komponensek
- `electron/`: Electron main process, preload, IPC csatornák és desktop állapot
- `lib/services/`: üzleti logika, Prisma műveletek, recept/auth/profil/favorite/rating logika
- `lib/renderer/api/`: renderer oldali kliensréteg, ami az Electron preloadon keresztül hív
- `prisma/`: Prisma schema, migrációk és seed
- `public/`: statikus assetek, logó és app ikon
- `scripts/`: fejlesztői és teszt scriptek
- `docs/`: Electron átállási dokumentáció

## Környezeti változók

Másold le az `.env.example` fájlt `.env` néven.

Fejlesztői SQLite példa:

```env
DATABASE_URL="file:./dev.db"
```

## Telepítés fejlesztéshez

```bash
npm install
npx prisma migrate dev
npx prisma db seed
```

## Desktop fejlesztői indítás

```bash
npm run dev:desktop
```

Ez egyszerre indítja:

- a Next fejlesztői renderert `http://localhost:3001` címen
- az Electron desktop shellt

## Tesztek és ellenőrzés

Lint:

```bash
npm run lint
```

Desktop smoke teszt:

```bash
npm run test:desktop
```

A smoke teszt végigpróbálja a fő desktop backend folyamatokat:

- login
- recept létrehozás képpel
- recept frissítés képcserével
- recept törlés képtörléssel
- kedvenc kapcsolás
- rating mentés
- profil adatok
- admin user létrehozás

## Natív SQLite modul megjegyzés

Az Electron és a sima Node eltérő natív modul ABI-t használhat. Emiatt a `better-sqlite3` modult néha újra kell fordítani.

Electron futtatáshoz:

```bash
npm run rebuild:electron
```

Sima Node futtatáshoz:

```bash
npm run rebuild:node
```

Ha `NODE_MODULE_VERSION` vagy `better_sqlite3.node` hibát látsz, általában ez a két parancs valamelyike a megoldás.

## Build

Webes build:

```bash
npm run build:web
```

Desktop build:

```bash
npm run build:desktop
```

A desktop build kimenete a `release/` mappába kerül.

## Seedelt belépési adatok

Alap teszt belépés:

```text
Felhasználónév: Test
Jelszó: Password
```

Admin felhasználó:

```text
Felhasználónév: Tamás
Jelszó: Password
```



## Állapot

Az app jelenlegi állapota: desktop átállás alatt, de a fő Electron/service alapú folyamatok már működnek.

Az `/app/api` mappa törölve lett, a fő backend logika már az Electron IPC és a `lib/services/*` réteg mögött van.
