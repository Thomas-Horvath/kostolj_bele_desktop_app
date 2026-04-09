"use client";

import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useFavorites } from "../context/FavoriteContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from '../styles/recipeCard.module.scss';

export default function FavoriteButton({ recipeId }) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(recipeId);
  const { data: session } = useSession();
  const router = useRouter();
  const isAuthenticated = Boolean(session?.user?.id);

  // Ha nincs bejelentkezve, ne jelenjen meg semmi
  if (!isAuthenticated) return null;


  return (
    <span className={styles.heart} onClick={() => { toggleFavorite(recipeId); router.refresh(); }}>
      {!isFavorite ? (
        <FaRegHeart className={styles.svg} />
      ) : (
        <FaHeart className={`${styles.svg} ${styles.added_heart}`} />
      )}
    </span>
  );
}
