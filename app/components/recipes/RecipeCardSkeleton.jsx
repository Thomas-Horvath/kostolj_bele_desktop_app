"use client";
import styles from "../../styles/recipeCard.module.scss";

export default function RecipeCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`}>
      <div className={styles.img_container}>
        <div className={styles.img_skeleton}></div>
      </div>
      <div className={styles.content_container}>
        <div className={styles.title_skeleton}></div>
      </div>
    </div>
  );
}
