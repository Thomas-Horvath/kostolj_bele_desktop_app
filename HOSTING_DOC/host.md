# Kóstolj Bele hostolás DigitalOcean dropletre

Ez a leírás a `kostolj_bele_sqlite` projekt jelenlegi, működő deploy menetét foglalja össze.

## Röviden

- Windowsról a projektet WSL Linux fájlrendszerbe kell átmásolni
- a build WSL alatt készüljön, ne `/mnt/c/...` alatt
- a release a standalone buildből áll össze
- a release kerüljön át `C:\Deploy\kostoljbele-release` alá
- ezt kell feltölteni a dropletre
- a dropleten a futtatás `node server.js` vagy PM2-vel történik
- az app elé Nginx reverse proxy kell
- a HTTPS-hez certbot / Let's Encrypt kell

## Miért így

Ez a projekt:

- Next.js standalone buildet használ
- Prisma-t használ
- SQLite-ot használ
- Auth.js / NextAuth alapú authentikáció van benne

Ezért fontos, hogy a végső build Linuxon készüljön.

## 1. Projekt átmásolása WSL-be

WSL-ben:

```bash
mkdir -p ~/projects
sudo chown -R $USER:$USER ~/projects
```

Friss másolat:

```bash
rm -rf ~/projects/kostoljbele
cp -a /mnt/c/Asztal/PK_2024/Projektek/PRODUCTION_NEXT_PROJECTS/KÓSTOLJ-BELE-App/kostolj_bele_sqlite ~/projects/kostoljbele
cd ~/projects/kostoljbele
```

## 2. Tisztítás másolás után

```bash
rm -rf node_modules .next generated prisma/generated
```

## 3. Függőségek és build

```bash
npm install
npx prisma generate
npm run build
```

Megjegyzés:

- az `EBADENGINE` warning önmagában még nem gond, ha az install és a build sikeres
- az `npm audit` figyelmeztetések miatt nem kell deploy előtt rögtön verziókat erőltetve frissíteni

## 4. Release mappa összerakása

Nem elég csak a `.next/standalone` mappa.

Mellé még kell:

- `.next/static`
- `prisma`
- `public`
- `.env`

Parancsok:

```bash
cd ~/projects/kostoljbele

rm -rf ~/deploy/kostoljbele-release
mkdir -p ~/deploy/kostoljbele-release/.next

cp -a .next/standalone/. ~/deploy/kostoljbele-release/
cp -a .next/static ~/deploy/kostoljbele-release/.next/
cp -a prisma ~/deploy/kostoljbele-release/
cp -a public ~/deploy/kostoljbele-release/
cp -a .env ~/deploy/kostoljbele-release/
```

## 5. Lokális smoke test WSL-ben

Fontos:

- ne közvetlenül a `.next/standalone` mappát futtasd
- a teljes release mappát futtasd

```bash
cd ~/deploy/kostoljbele-release
AUTH_TRUST_HOST=true NEXTAUTH_URL=http://localhost:9005 node server.js
```

Ha a release indul, akkor az alapok rendben vannak.

### Korábbi tipikus hibák

`Cannot open database because the directory does not exist`

- oka: a `prisma` mappa nem volt a release-ben

`The requested resource isn't a valid image for /banner6.webp`

- oka: a `public` mappa hiányzott

`UntrustedHost`

- megoldás: `AUTH_TRUST_HOST=true`

## 6. Release átmásolása Windowsra

```bash
mkdir -p /mnt/c/Deploy
rm -rf /mnt/c/Deploy/kostoljbele-release
cp -a ~/deploy/kostoljbele-release /mnt/c/Deploy/
```

Ezt kell feltölteni:

```text
C:\Deploy\kostoljbele-release
```

## 7. Mit kell feltölteni a dropletre

Nem a teljes projektet kell feltölteni, hanem a release mappa teljes tartalmát.

A célmappa például:

```bash
/var/www/kostolj-bele
```

Ennek legalább ezeket kell tartalmaznia:

- `server.js`
- `.next/static`
- `public`
- `prisma`
- `.env` vagy PM2 env beállítások
- a standalone által behúzott `node_modules` részek

## 8. Indítás a dropleten

Közvetlen teszt:

```bash
cd /var/www/kostolj-bele
AUTH_TRUST_HOST=true node server.js
```

A tényleges futtatás inkább PM2-vel történjen.

## 9. PM2 ecosystem config

Mivel a projekt `package.json` fájljában `type: "module"` van, ezért a PM2 config ne `.js`, hanem `.cjs` legyen.

Ajánlott fájlnév:

```text
ecosystem.config.cjs
```

Példa:

```js
module.exports = {
  apps: [
    {
      name: "kostolj-bele",
      cwd: "/var/www/kostolj-bele",
      script: "server.js",
      env: {
        AUTH_TRUST_HOST: "true",
        NODE_ENV: "production",
        PORT: "9005",
        DATABASE_URL: "file:./prisma/dev.db",
        NEXTAUTH_SECRET: "valami_titok_jelszo9876524"
      },
    },
  ],
};
```

Megjegyzések:

- a `DATABASE_URL` ne maradjon a korábbi Wordy útvonalon
- jó érték: `file:./prisma/dev.db`
- a `NEXTAUTH_SECRET` kell
- a `NEXTAUTH_URL` lehet opcionális, de ha auth vagy cookie probléma van, érdemes beállítani a valódi domainre
- a `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` jelenleg nem szükséges ehhez a projekthez

Indítás:

```bash
cd /var/www/kostolj-bele
pm2 start ecosystem.config.cjs
pm2 save
```

## 10. PM2 ellenőrzés

```bash
pm2 status
pm2 logs kostolj-bele --lines 100
```

Helyi HTTP teszt a szerveren:

```bash
curl -I http://127.0.0.1:9005
curl http://127.0.0.1:9005
```

## 11. Nginx beállítás

Új site fájl:

```bash
sudo nano /etc/nginx/sites-available/kostolj-bele
```

Tartalom:

```nginx
server {
    listen 80;
    server_name kostoljbele.thomasapi.eu www.kostoljbele.thomasapi.eu;

    location / {
        proxy_pass http://127.0.0.1:9005;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Bekapcsolás:

```bash
sudo ln -s /etc/nginx/sites-available/kostolj-bele /etc/nginx/sites-enabled/
```

Ha kell, a default site kikapcsolása:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Teszt és reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 12. HTTPS / Let's Encrypt

Telepítés:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

Tanúsítvány:

```bash
sudo certbot --nginx -d kostoljbele.thomasapi.eu -d www.kostoljbele.thomasapi.eu
```

Ez általában:

- létrehozza a certet
- átírja az nginx configot
- beállítja a HTTPS redirectet

Ellenőrzés:

```bash
sudo nginx -t
systemctl status nginx
curl -I https://a-domainod.hu
```

## 13. Auth környezeti változók

Hasznos production értékek:

```env
AUTH_TRUST_HOST=true
NEXTAUTH_SECRET=egy-hosszu-veletlen-titok
DATABASE_URL=file:./prisma/dev.db
PORT=9005
```

Opcionálisan:

```env
NEXTAUTH_URL=https://kostoljbele.thomasapi.eu
```

Megjegyzés:

- a `NEXTAUTH_SECRET` kell a jelenlegi auth implementációhoz
- a `NEXTAUTH_URL` nem feltétlenül kötelező, de productionben ajánlott

## 14. Gyors ellenőrző lista

- a build WSL Linux fájlrendszerben készült
- a release-ben benne van a `.next/static`
- a release-ben benne van a `prisma`
- a release-ben benne van a `public`
- a release-ben benne van a `.env` vagy PM2 env
- a PM2 config `.cjs`
- a PM2 process fut
- az Nginx proxy a `127.0.0.1:9005` portra mutat
- a domain a dropletre mutat
- a certbot lefutott
- a főoldal, login és adatbázisos oldalak működnek

## 15. Egyben a WSL build-release menet

```bash
rm -rf ~/projects/kostoljbele
cp -a /mnt/c/Asztal/PK_2024/Projektek/PRODUCTION_NEXT_PROJECTS/KÓSTOLJ-BELE-App/kostolj_bele_sqlite ~/projects/kostoljbele
cd ~/projects/kostoljbele
rm -rf node_modules .next generated prisma/generated
npm install
npx prisma generate
npm run build
rm -rf ~/deploy/kostoljbele-release
mkdir -p ~/deploy/kostoljbele-release/.next
cp -a .next/standalone/. ~/deploy/kostoljbele-release/
cp -a .next/static ~/deploy/kostoljbele-release/.next/
cp -a prisma ~/deploy/kostoljbele-release/
cp -a public ~/deploy/kostoljbele-release/
cp -a .env ~/deploy/kostoljbele-release/
cd ~/deploy/kostoljbele-release
AUTH_TRUST_HOST=true NEXTAUTH_URL=http://localhost:9005 node server.js
mkdir -p /mnt/c/Deploy
rm -rf /mnt/c/Deploy/kostoljbele-release
cp -a ~/deploy/kostoljbele-release /mnt/c/Deploy/
```
