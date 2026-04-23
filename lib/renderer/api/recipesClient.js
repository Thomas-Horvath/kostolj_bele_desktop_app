import { getDesktopApi } from "./getDesktopApi";

async function serializeRecipeFile(file) {
  if (!file) {
    return null;
  }

  // A File objektumot nem tudjuk kozvetlenul IPC-n atkuldeni megbizhatoan,
  // ezert itt szerializaljuk egyszeru adatstruktura + ArrayBuffer alakra.
  // A main process oldalon ebbol lesz ujra Blob/FormData.
  return {
    name: file.name || "recipe-image",
    type: file.type || "application/octet-stream",
    size: file.size || 0,
    buffer: await file.arrayBuffer(),
  };
}

async function serializeRecipeMutationPayload(payload = {}) {
  // A create/update hivasoknal a kep kulon figyelmet igenyel.
  // A tobbi adat egyszeru JSON-szeru forma marad, a file pedig kulon
  // szerializalt mezokent megy tovabb.
  return {
    ...payload,
    file: await serializeRecipeFile(payload.file),
  };
}

const recipesClient = {
  list(query) {
    return getDesktopApi().recipes.list(query);
  },
  getById(id) {
    return getDesktopApi().recipes.getById(id);
  },
  getBySlug(slug) {
    return getDesktopApi().recipes.getBySlug(slug);
  },
  getEditableBySlug(slug) {
    return getDesktopApi().recipes.getEditableBySlug(slug);
  },
  getByCategory(payload) {
    return getDesktopApi().recipes.getByCategory(payload);
  },
  async create(payload) {
    // A frontend innentol nem route-ot hiv, hanem egy uzleti muveletet:
    // "hozz letre receptet". A route-os reszlet az IPC mogott marad.
    return getDesktopApi().recipes.create(
      await serializeRecipeMutationPayload(payload)
    );
  },
  async update(payload) {
    return getDesktopApi().recipes.update(
      await serializeRecipeMutationPayload(payload)
    );
  },
  remove(id) {
    return getDesktopApi().recipes.remove(id);
  },
  listTypes() {
    return getDesktopApi().recipes.listTypes();
  },
};

export default recipesClient;
