"use client";
import styles from "../../styles/recipeCard.module.scss";

export default function RecipeCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`}>
      <div className={styles.img_container}>
        <div className={styles.img_skeleton}></div>
      </div>
      <div className={styles.content_container}>
        <div className={styles.rate_container}>
          <div className={styles.starsWrapper}>
            <div className={styles.star_skeleton}></div>
            <div className={styles.star_skeleton}></div>
            <div className={styles.star_skeleton}></div>
            <div className={styles.star_skeleton}></div>
            <div className={styles.star_skeleton}></div>
          </div>
          <div className={styles.text_skeleton}></div>
        </div>
        <div className={styles.title_skeleton}></div>
      </div>
    </div>
  );
}

