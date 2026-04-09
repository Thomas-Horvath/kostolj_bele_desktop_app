export default function slugify(str) {
  return str
    .normalize("NFD")                  // é -> e + ´
    .replace(/[\u0300-\u036f]/g, "")   // eltávolítja a diakritikus jeleket
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")              // szóköz -> kötőjel
    .replace(/[^a-z0-9-]/g, "");       // minden mást kidob (pl. írásjelek)
}

// Példa:
// console.log(slugify("Pörkölt Ételek 2024!")); 

