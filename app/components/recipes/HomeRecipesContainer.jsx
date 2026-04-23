"use client";

import styles from "../../styles/home.module.scss";
import { useRate } from "../../context/RateContext";
import RecipeCard from "./RecipeCard";
import RecipeCardSkeleton from "./RecipeCardSkeleton";

const HomeRecipesContainer = () => {
  const { topEightRecipes, loading } = useRate();

  return (
    <div className={styles.card_container}>
      {loading
        ? Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
        : topEightRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
    </div>
  );
};

export default HomeRecipesContainer;

