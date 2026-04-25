import { contextBridge, ipcRenderer } from "electron";

// A preload a renderer egyetlen hivatalos hidja a desktop backend fele.
// Itt szandekosan szuk, dokumentalt API-t adunk a window-ra, hogy a kesobbi
// atiras ne csusszon vissza Node-hozzafereses, nehezen karbantarthato mintaba.
//
// Mentalis modell:
// - a renderer nem hivhat kozvetlenul `ipcRenderer.invoke`-ot szetszorva
// - a renderer nem importalhat `fs`, `path`, `electron` stb.
// - helyette a preload kitesz egy szabalyos API-t a `window.appApi` ala
//
// Tehat amikor kesobb a React oldalrol ezt latod:
//   window.appApi.recipes.list()
// akkor az valojaban:
//   renderer -> preload -> ipc -> main process -> service -> prisma/filesystem
// utat jelent.
function invoke(channel, payload) {
  return ipcRenderer.invoke(channel, payload);
}

const appApi = {
  app: {
    // Altalanos desktop futasi metadata.
    getRuntimeInfo() {
      return invoke("app:get-runtime-info");
    },
  },
  backup: {
    // A backup namespace kifejezetten a teljes desktop adatallomany
    // exportjat es visszaallitasat kezeli.
    exportData() {
      return invoke("backup:export");
    },
    importData() {
      return invoke("backup:import");
    },
  },
  auth: {
    // A vegso cel az, hogy ez a login mar ne NextAuth route-ot hivjon,
    // hanem kozvetlenul a desktop auth service-t.
    login(credentials) {
      return invoke("auth:login", credentials);
    },
    logout() {
      return invoke("auth:logout");
    },
    getCurrentUser() {
      return invoke("auth:get-current-user");
    },
  },
  recipes: {
    // A receptek namespace lesz a legnagyobb domain.
    // Itt egyelore csak a szerzodes keszul, az implementacio kovetkezik.
    list(query) {
      return invoke("recipes:list", query);
    },
    getById(id) {
      return invoke("recipes:get-by-id", id);
    },
    getBySlug(slug) {
      return invoke("recipes:get-by-slug", slug);
    },
    getEditableBySlug(slug) {
      return invoke("recipes:get-editable-by-slug", slug);
    },
    getByCategory(payload) {
      return invoke("recipes:get-by-category", payload);
    },
    create(payload) {
      return invoke("recipes:create", payload);
    },
    update(payload) {
      return invoke("recipes:update", payload);
    },
    remove(id) {
      return invoke("recipes:delete", id);
    },
    listTypes() {
      return invoke("recipes:list-types");
    },
  },
  profile: {
    // Profil = sajat receptek + kedvencek + admin userkezeles
    get() {
      return invoke("profile:get");
    },
    createUser(payload) {
      return invoke("profile:create-user", payload);
    },
  },
  favorites: {
    // Kedvencek kulon namespace-ben maradnak, hogy a UI oldalon is jol
    // elkulonuljon a profil es a receptlista logikatol.
    list() {
      return invoke("favorites:list");
    },
    toggle(recipeId) {
      return invoke("favorites:toggle", recipeId);
    },
  },
  rating: {
    save(payload) {
      return invoke("rating:save", payload);
    },
  },
  images: {
    // A kepekhez kesobb desktop file picker es sajat URL-logika fog tartozni.
    selectFile() {
      return invoke("images:select-file");
    },
    getUrl(imageName) {
      return invoke("images:get-url", imageName);
    },
  },
};

// Ez teszi elerhetove a bridge-et a renderer szamara `window.appApi` neven.
contextBridge.exposeInMainWorld("appApi", appApi);
