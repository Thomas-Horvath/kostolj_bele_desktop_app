"use client";

import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useFavorites } from "../../context/FavoriteContext";
import { useRouter } from "next/navigation";
import styles from "../../styles/recipeCard.module.scss";
import { useDesktopAuth } from "../../context/DesktopAuthContext";

export default function FavoriteButton({ recipeId }) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(recipeId);
  const { isAuthenticated } = useDesktopAuth();
  const router = useRouter();

  if (!isAuthenticated) return null;

  return (
    <span
      className={styles.heart}
      onClick={() => {
        toggleFavorite(recipeId);
        router.refresh();
      }}
    >
      {!isFavorite ? (
        <FaRegHeart className={styles.svg} />
      ) : (
        <FaHeart className={`${styles.svg} ${styles.added_heart}`} />
      )}
    </span>
  );
}
