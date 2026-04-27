# Kóstolj Bele! Desktop App

Ez a projekt a már létező **Kóstolj Bele!** receptes weboldal privát Windows desktop appá alakított változata.

Az átalakítás célja az volt, hogy az alkalmazás ne nyilvános weboldalként működjön, hanem helyben futó, személyes receptgyűjteményként. A használati cél egyszerű: a feleségem saját receptjeit tudja benne kezelni kényelmesen, publikus webes üzemeltetés nélkül.

## Röviden

- Next.js alapú React felület
- Electron desktop shell
- Prisma ORM `6.16.2`
- SQLite adatbázis
- saját desktop autentikáció
- helyi receptkép-kezelés
- Electron IPC + `lib/services/*` backend logika
- Next `/app/api` route-ok nélkül

## Mit tud az app?

- receptek létrehozása, szerkesztése és törlése
- receptképek mentése, cseréje és törlése
- kategória és alkategória alapú böngészés
- receptkeresés
- kedvencek kezelése
- profil oldal
- admin alapú felhasználókezelés
- backup export/import
- az utoljára bejelentkezett user megjegyzése desktop sessionben

## Miért desktop app?

Az eredeti app weboldalként indult, de ennél a verziónál a cél már nem a hosting vagy a publikus elérés.

A desktop verzió előnyei:

- privát használatra alkalmas
- nem kell külön szerver
- az adatbázis és a receptképek helyben vannak
- egyszerűbb authentikáció elég
- alkalmazásszerűbb használatot ad

## Technológiai stack

- Next.js `15.5`
- React `19`
- Electron `41`
- Prisma ORM `6.16.2`
- SQLite
- Sass moduláris stílusok

## Architektúra

A régi webes backend route-ok ki lettek vezetve.

Az új desktop adatfolyam:

```text
React UI
  -> lib/renderer/api
  -> Electron preload
  -> Electron IPC
  -> lib/services
  -> Prisma
  -> SQLite
```

Ez azt jelenti, hogy a React felület már nem `/api/...` útvonalakat hív, hanem az Electron main process mögött futó üzleti logikát használja.

## Fontos mappák

- `app/`: Next.js App Router felület és React komponensek
- `electron/`: Electron main process, preload, IPC csatornák, session és desktop bootstrap
- `lib/services/`: üzleti logika auth, receptek, profil, kedvencek és backup kezeléshez
- `lib/renderer/api/`: renderer oldali kliensréteg az Electron preload fölött
- `prisma/`: Prisma schema, seed, fejlesztői adatbázis
- `generated/prisma/`: generált Prisma kliens
- `public/`: statikus assetek, logó, app ikon
- `uploads/recipe-images/`: fejlesztői projektben seedelt receptképek
- `scripts/`: buildhez és karbantartáshoz használt segédscriptek
- `docs/`: bővebb Electron dokumentáció
- `HOSTING_DOC/`: átállási napló

## Környezeti változók

Példa:

```env
DATABASE_URL="file:./dev.db"
```

Fejlesztés közben az Electron app közvetlenül a projekt `prisma/dev.db` adatbázisát használja.  
Telepített appnál a DB az AppData alá kerül.

## Telepítés fejlesztéshez

```bash
npm install
npx prisma generate
npx prisma db push --force-reset
node prisma/seed.js
```

## Fejlesztői indítás

```bash
npm run dev:desktop
```

Ez egyszerre indítja:

- a Next fejlesztői renderert `http://localhost:3010` címen
- az Electron desktop shellt

## Ellenőrzések

Lint:

```bash
npm run lint
```

Desktop smoke teszt:

```bash
npm run test:desktop
```

Megjegyzés: a smoke teszt bizonyos Windows környezetekben helyi `Prisma spawn EPERM` miatt érzékeny lehet. Ez nem feltétlenül ugyanaz, mint a telepített app működése.

## Build

Web build:

```bash
npm run build:web
```

Desktop build:

```bash
npm run build:desktop
```

A desktop build a `release/` mappába kerül.

Telepítő például:

- `release/Kostolj Bele Setup 2.0.1.exe`

## Seedelt belépési adatok

Admin user:

```text
Felhasználónév: Tamás
Jelszó: Password
```

Normál user:

```text
Felhasználónév: Katinka
Jelszó: Password
```

## Fontos desktop útvonalak

Telepített app helye:

```text
C:\Users\<felhasználó>\AppData\Local\Programs\kostolj_bele
```

App adatbázis:

```text
C:\Users\<felhasználó>\AppData\Roaming\kostolj_bele\db\app.db
```

Receptképek:

```text
C:\Users\<felhasználó>\AppData\Roaming\kostolj_bele\recipe-images
```

Main process log:

```text
C:\Users\<felhasználó>\AppData\Roaming\kostolj_bele\logs\main.log
```

## Fontos Prisma megjegyzés

A telepített appnál a Prisma `binary` engine Windows alatt `spawn EPERM` hibát okozott bejelentkezéskor és más első adatbázis-műveleteknél.

Ezért a projekt most `library` engine-t használ a [schema.prisma](./prisma/schema.prisma) fájlban. Ez stabilabb a telepített Electron appban, mert nem külön `query-engine` folyamatot indít, hanem az app folyamatán belül tölti be a Prisma motort.

## Állapot

Az app fő desktop folyamatai jelenleg működnek:

- bejelentkezés
- profil
- receptek listázása
- kategória és alkategória szűrés
- kedvencek
- recept létrehozás, szerkesztés, törlés
- képek kezelése
- backup export/import

Az `/app/api` mappa törölve lett, a fő backend logika már az Electron IPC és a `lib/services/*` réteg mögött fut.
