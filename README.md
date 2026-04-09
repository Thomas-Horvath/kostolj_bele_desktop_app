# Kóstolj Bele!

Receptgyűjtő alkalmazás Next.js 16, Prisma ORM 7 és NextAuth alapokon.

A projekt célja egy rendezett, kereshető, vizuálisan igényes receptplatform, ahol a felhasználók saját recepteket hozhatnak létre, szerkeszthetnek, kedvenceket menthetnek és értékelhetnek.

## Fő funkciók

- recept létrehozása, szerkesztése és törlése
- kategória alapú böngészés
- keresés név és kategória alapján
- kedvencek kezelése
- receptértékelés
- admin alapú felhasználókezelés

## Jogosultsági működés

- A publikus regisztráció ki van vezetve.
- Új felhasználót csak az admin tud létrehozni a profiloldalról.
- Az alap admin felhasználó `Tamás`.
- A seed három felhasználót hoz létre: `Tamás`, `Katinka`, `Test`.
- Tamás szerepköre `ADMIN`, a többiek normál `USER` szerepkört kapnak.

## Technológiai stack

- Next.js 16.2
- React 19
- Prisma ORM 7
- SQLite fejlesztői adatbázis
- NextAuth hitelesítés
- Sass moduláris stílusok

## Verziókövetelmények

- Node.js `20.9` vagy frissebb
- npm `10+` ajánlott

Ez különösen fontos WSL és DigitalOcean környezetben, mert a Next.js 16 és a Prisma 7 már modernebb Node futtatókörnyezetre épít.

## Környezeti változók

Másold le az `.env.example` fájlt `.env` néven, és töltsd ki a saját értékeiddel.

Fejlesztői alapértékek:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="csereld-egy-hosszu-veletlen-titokra"
```

## Fejlesztői indítás

1. Telepítsd a csomagokat:

```bash
npm install
```

2. Futtasd a migrációkat:

```bash
npx prisma migrate dev
```

3. Seedeld az adatbázist:

```bash
npx prisma db seed
```

4. Indítsd el a fejlesztői szervert:

```bash
npm run dev
```

## Build WSL / Linux alatt

A projekt úgy van előkészítve, hogy WSL-ben és Linuxos szerveren is jól buildelhető legyen.

Ajánlott sorrend:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run lint
npm run build
npm run start
```

## DigitalOcean / self-hosting megjegyzés

A `next.config.mjs` fájl `standalone` outputot használ, ami praktikus self-hostinghoz, mert a build után egy futtatásra készebb Next.js szervercsomag jön létre.

## Seedelt belépési adatok

- Felhasználónév: `Test` | Jelszó: `Password`

## GitHub feltöltés előtt

Ezeket ne töltsd fel a repóba:

- `.env`
- bármelyik helyi `.env.*`
- `prisma/*.db`
- `prisma/*.db-journal`
- `.next`
- `node_modules`

Ezeket a `.gitignore` már kezeli.

## Prisma megjegyzés

A korábbi `package.json#prisma` beállítás helyett a projekt most már `prisma.config.ts` fájlt használ. Ez a Prisma 7 által támogatott konfigurációs forma.

A kliensgenerálás is frissült:

- a schema `prisma-client` generátort használ
- a generált kliens a `generated/prisma` mappába kerül
- SQLite esetén a futó alkalmazás `@prisma/adapter-better-sqlite3` adapterrel csatlakozik

Ez a felállás stabilabb Linuxos buildnél és jobban illeszkedik a Prisma 7 új működéséhez.

## Frissítés utáni teendő

Ha a projekt korábban Prisma 6 vagy régebbi Next.js verzióval futott, érdemes ezeket a parancsokat egymás után lefuttatni:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Ha tiszta adatbázissal szeretnél indulni, akkor használhatod ezt is:

```bash
npx prisma migrate reset
```
