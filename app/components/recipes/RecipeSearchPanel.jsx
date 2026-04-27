"use client";

import contentStyles from "../../styles/recipeLayout.module.scss";
import sidebarStyles from "../../styles/sidebar.module.scss";

export default function RecipeSearchPanel({ variant = "content", onSubmit }) {
  const styles = variant === "sidebar" ? sidebarStyles : contentStyles;

  return (
    <section className={styles.searchPanel}>
      <div className={styles.searchPanelHeader}>
        <p className={styles.searchEyebrow}>Keresés</p>
        <h2>Receptek keresése</h2>
      </div>

      <form action="/receptek" className={styles.searchForm} onSubmit={onSubmit}>
        <input
          type="text"
          name="q"
          placeholder="Keresés név, kategória vagy alkategória alapján..."
        />
        <button type="submit" className="btn-orange">
          Keresés
        </button>
      </form>
    </section>
  );
}
