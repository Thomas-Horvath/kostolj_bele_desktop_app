"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import style from "../../../styles/recipeDetail.module.scss";
import RateRecipe from "../../../components/recipes/RateRecipe";
import Spinner from "../../../components/ui/Spinner";
import { formatIngredientQuantity } from "../../../../lib/recipeOptions";
import { getRecipeImageSrc } from "../../../../lib/recipeImageUrl";
import recipesClient from "../../../../lib/renderer/api/recipesClient";




function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function RecipeDetailsPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecipe() {
      try {
        setLoading(true);
        setPageError("");

        // A részletező oldal most már a desktop recipes kliensen keresztül kér adatot,
        // így a React oldal nem nyúl közvetlenül a Prisma réteghez.
        const data = await recipesClient.getBySlug(slug);

        if (isMounted) {
          setRecipe(data);
        }
      } catch (error) {
        if (isMounted) {
          setRecipe(null);
          setPageError(
            error instanceof Error
              ? error.message
              : "Nem sikerult betolteni a receptet."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadRecipe();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return <Spinner />;
  }

  if (pageError || !recipe) {
    return (
      <section className={style.page_container}>
        <div className={style.hero}>
          <div className={style.hero_content}>
            <p className={style.eyebrow}>Recept részletek</p>
            <h1>Nem sikerult betolteni a receptet</h1>
            <p className={style.note_text}>
              {pageError || "A keresett recept nem erheto el."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={style.page_container}>
      <div className={style.hero}>
        <div className={style.hero_content}>
          <p className={style.eyebrow}>Recept részletek</p>
          <h1 className={style.name}>{recipe.name}</h1>
          <div className={style.meta_row}>
            <span className={style.meta_chip}>Kategória: {recipe.type.name}</span>
            {recipe.subtype ? (
              <span className={style.meta_chip}>
                Alkategória: {recipe.subtype.name}
              </span>
            ) : null}
            <span className={style.meta_chip}>
              Szerző: {recipe.author?.name || "Ismeretlen"}
            </span>
          </div>
          <RateRecipe recipeId={recipe.id} initialScore={recipe.rate} />
        </div>

        <div className={style.image_card}>
          {/* Electron alatt a receptkepet a main process sajat `kb-image://`
              protokollja adja vissza, ezert itt nem a Next Image optimalizalot,
              hanem natív img taget hasznalunk. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getRecipeImageSrc(recipe.imageURL)}
            className={style.img}
            alt={recipe.name}
          />
        </div>
      </div>

      <section className={`${style.panel} ${style.note_panel}`}>
        <h2 className={style.titles}>Megjegyzés</h2>
        <p className={style.note_text}>
          {recipe.note?.trim() ||
            "Ehhez a recepthez még nincs külön megjegyzés vagy extra konyhai tipp megadva."}
        </p>
      </section>

      <div className={style.content_grid}>
        <section className={style.panel}>
          <h2 className={style.titles}>Hozzávalók</h2>
          <ul className={style.ingredients}>
            {recipe.ingredients.map((ingredient) => (
              <li className={style.ingredient_item} key={ingredient.id}>
                <span className={style.list_number}>🥣</span>
                <div className={style.ingredient_content}>
                  <strong>{capitalize(ingredient.name)}</strong>
                  <p>Mennyiség: {formatIngredientQuantity(ingredient)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={style.panel}>
          <h2 className={style.titles}>Elkészítés</h2>
          <ul className={style.steps}>
            {recipe.steps.map((step, index) => (
              <li key={step.id} className={style.step_item}>
                <span className={style.list_number}>{index + 1}.</span>
                <div className={style.step_content}>
                  <p className={style.content}>{step.content}</p>
                  <span className={style.timer}>⏱ {step.timer} perc</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
