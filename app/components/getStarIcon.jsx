import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import style from "../styles/recipeRateStars.module.scss";

export function getStarIcon(recipeRating, starIndex) {
  let rating = Math.floor(recipeRating);
  let rest = Math.round((recipeRating - rating) * 10);

  // Ez a csillag pontosan a starIndex-edik helyet jelöli (1–5)
  if (starIndex <= rating) {
    return <FaStar className={style.star_gold} />;
  } else if (starIndex === rating + 1 && rest > 0) {
    if (rest < 3) {
      return <FaRegStar className={style.star_empty} />;
    } else if (rest < 7) {
      return <FaStarHalfAlt className={style.star_gold}   />;
    } else {
      return <FaStar className={style.star_gold}  />;
    }
  } else {
    return <FaRegStar className={style.star_empty}  />;
  }
}
