import Image from "next/image";
import style from '../../../styles/recipeDetail.module.scss'
import { prisma } from '../../../../lib/prisma';
import RateRecipe from "../../../components/RateRecipe";
import { notFound } from "next/navigation";
import { formatIngredientQuantity } from "../../../../lib/recipeOptions";




const RecipeDetails = async ({ params }) => {
  const resolvedParams = await params;
 



  const recipe = await prisma.recipe.findUnique(
    {
      where: { slug: resolvedParams.slug },
      include: {
        ingredients: true,
        steps: true,
        type: true,
      }
    }
  );

  // Ha nincs ilyen slug, a Next saját 404 oldalára küldünk,
  // így nem null hivatkozásból lesz szerverhiba.
  if (!recipe) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: recipe.authorId }
  });






  //* nagy kezdőbetűvé alakítás
  function capitalize(s) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <section className={style.page_container}>
      <div className={style.hero}>
        <div className={style.hero_content}>
          <p className={style.eyebrow}>Recept részletek</p>
          <h1 className={style.name}>{recipe.name}</h1>
          <div className={style.meta_row}>
            <span className={style.meta_chip}>Kategória: {recipe.type.name}</span>
            <span className={style.meta_chip}>Szerző: {user?.name || "Ismeretlen"}</span>
          </div>
          <RateRecipe recipeId={recipe.id} initialScore={recipe.rate} />
        </div>

        <div className={style.image_card}>
          <Image
            src={`/images/${recipe.imageURL}`}
            width={900}
            height={700}
            className={style.img}
            alt={recipe.name}
            priority
            unoptimized
          />
        </div>
      </div>

      <section className={`${style.panel} ${style.note_panel}`}>
        <h2 className={style.titles}>Megjegyzés</h2>
        <p className={style.note_text}>
          {recipe.note?.trim() || "Ehhez a recepthez még nincs külön megjegyzés vagy extra konyhai tipp megadva."}
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
            {recipe.steps.map((step, i) => (
              <li key={step.id} className={style.step_item}>
                <span className={style.list_number}>{i + 1}.</span>
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

export default RecipeDetails
