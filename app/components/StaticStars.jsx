"use client";
import style from "../styles/recipeRateStars.module.scss";
import { getStarIcon } from "./getStarIcon";

export default function StaticStars({ recipeRating, isCard }) {
    return (
        <div className={style.star_container}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    className={isCard ? style.star_span : style.star_span_rate}
                >
                    {getStarIcon(recipeRating, i)}
                </span>
            ))}
        </div>
    );
}
