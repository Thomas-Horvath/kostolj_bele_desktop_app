export function getRecipeImageSrc(imageURL) {
  if (!imageURL) {
    return "/banner6.webp";
  }

  return `/api/recipe-images/${encodeURIComponent(imageURL)}`;
}
