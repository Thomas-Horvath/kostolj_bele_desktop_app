"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import RecipeCard from "../../../../../components/recipes/RecipeCard";
import Spinner from "../../../../../components/ui/Spinner";
import styles from "../../../../../styles/recipes.module.scss";
import recipesClient from "../../../../../../lib/renderer/api/recipesClient";

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const type = typeof params?.type === "string" ? params.type : "";
  const subtype = searchParams.get("subtype") || "";

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCategoryData() {
      try {
        setLoading(true);
        setPageError("");

        // A kategóriaoldal ugyanazt az adatot kéri le, mint korábban a szerverkomponens,
        // csak most már az Electron bridge mögötti recipes kliensen keresztül.
        const data = await recipesClient.getByCategory({ type, subtype });

        if (isMounted) {
          setCategoryData(data);
        }
      } catch (error) {
        if (isMounted) {
          setCategoryData(null);
          setPageError(
            error instanceof Error
              ? error.message
              : "Nem sikerult betolteni a kategoria adatait."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (type) {
      loadCategoryData();
    }

    return () => {
      isMounted = false;
    };
  }, [subtype, type]);

  if (loading) {
    return <Spinner />;
  }

  if (pageError || !categoryData) {
    return (
      <div className={styles.container}>
        <div className={styles.main_container}>
          <h1 className={styles.main_title}>Nem sikerult betolteni a kategoriat</h1>
          <p>{pageError || "A keresett kategoria nem erheto el."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.main_container}>
        <h1 className={styles.main_title}>
          Kategória: {categoryData.type.name}
          {categoryData.activeSubtype ? ` / ${categoryData.activeSubtype.name}` : ""}
        </h1>
        <div className={styles.card_container}>
          {categoryData.recipes.length === 0 ? (
            <p>Még nincs étel a kategóriában!</p>
          ) : (
            categoryData.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
