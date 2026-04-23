// Ez a barrel file szandekosan osszefogja a desktop renderer klienseket,
// hogy az app komponensei egy helyrol erjek el az Electron IPC-re epulo
// kliensreteget. A regi Next API route-ok mar torolve lettek.

export { default as appClient } from "./appClient";
export { default as authClient } from "./authClient";
export { default as favoritesClient } from "./favoritesClient";
export { default as imageClient } from "./imageClient";
export { default as profileClient } from "./profileClient";
export { default as ratingClient } from "./ratingClient";
export { default as recipesClient } from "./recipesClient";
