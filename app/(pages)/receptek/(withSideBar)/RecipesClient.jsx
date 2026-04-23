"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../../../styles/recipes.module.scss";
import RecipeCard from "../../../components/recipes/RecipeCard";
import RecipeCardSkeleton from "../../../components/recipes/RecipeCardSkeleton";
import recipesClient from "../../../../lib/renderer/api/recipesClient";

export default function RecipesClient({ initialQuery = "" }) {
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    // A keresési kulcsszót a route query stringből olvassuk,
    // hogy frissítés és link megnyitás után is megmaradjon.
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);

    recipesClient
      .list(query)
      .then(data => setRecipes(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setRecipes([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className={styles.container}>
      <div className={styles.main_container}>
        <div className={styles.title_row}>
          <h1 className={styles.main_title}>
            {query ? `Keresési találatok: "${query}"` : "Receptek"}
          </h1>
          {query ? (
            <p className={styles.result_summary}>
              {recipes.length} találat név, kategória vagy alkategória alapján
            </p>
          ) : null}
        </div>
        <div className={styles.card_container}>
          {loading
            // A skeletonnek fix elemszám kell, különben üres tömbből nem jelenik meg semmi betöltéskor.
            ? Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
            : recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
        {!loading && recipes.length === 0 ? (
          <div className={styles.empty_state}>
            <h2>Nincs találat</h2>
            <p>
              Próbálj meg más receptnevet, kategóriát vagy alkategóriát keresni,
              például: húsételek, csirke, desszertek, krémlevesek.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
