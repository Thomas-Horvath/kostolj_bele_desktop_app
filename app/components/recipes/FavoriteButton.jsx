"use client";

import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavorite } from "../../context/FavoriteContext";
import styles from "../../styles/recipeCard.module.scss";

export default function FavoriteButton({ recipeId }) {
  // A gomb csak a saját receptjéhez tartozó állapotot figyeli.
  // Ettől nem kell az egész lista összes favoritját újra renderelni.
  const { isFavorite, isPending, toggleFavorite } = useFavorite(recipeId);

  return (
    <button
      type="button"
      className={styles.heart}
      onClick={(event) => {
        // A szív gomb a kártyán belül egy Link fölött ül.
        // Ezért leállítjuk a default kattintást és a bubblingot is,
        // különben a kedvenc jelölés közben a kártya navigációja is elindulhatna.
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite();
      }}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Eltávolítás a kedvencek közül" : "Hozzáadás a kedvencekhez"}
    >
      {/* A vizuális állapotot teljesen a store-ból kapjuk:
          nem helyi useState dönti el, hanem az aktuális favorit snapshot. */}
      {!isFavorite ? (
        <FaRegHeart className={styles.svg} />
      ) : (
        <FaHeart className={`${styles.svg} ${styles.added_heart}`} />
      )}
    </button>
  );
}
