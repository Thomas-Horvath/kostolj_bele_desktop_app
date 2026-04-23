"use client";
import { useState } from "react";

import StaticStars from "../ui/StaticStars";
import style from "../../styles/recipeRateStars.module.scss";
import { getStarIcon } from "./getStarIcon";
import Link from "next/link";
import { useRate } from "../../context/RateContext";
import { useDesktopAuth } from "../../context/DesktopAuthContext";
import ratingClient from "../../../lib/renderer/api/ratingClient";

export default function RateRecipe({ recipeId, initialScore }) {
  const { isAuthenticated } = useDesktopAuth();

  const [hover, setHover] = useState(0);
  const { ratings, updateRating } = useRate();

  const score = ratings[recipeId] ?? initialScore;

  const handleClick = async (value) => {
    // A komponens mar nem /api route-ot hiv, hanem a renderer rating klienst.
    // A kliens mogott az Electron IPC es a ratingService vegzi a mentest.
    const data = await ratingClient.save({ recipeId, score: value });
    updateRating(recipeId, data.average);
  };

  const handleMove = (e, star) => {
    if (!isAuthenticated) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const value = star - (x < width / 2 ? 0.5 : 0);
    setHover(value);
  };

  const renderStar = (star) => {
    const current = hover || score;
    return getStarIcon(current, star);
  };

  return (
    <div className={style.rate_section}>
      <p className={style.rate}>
        Értékelés: {score ? score.toFixed(1) : "Nincs még értékelés"}
      </p>

      {isAuthenticated ? (
        <div className={`${style.star_container_rate} ${style.pointer}`}>
          <div className={style.wrapper}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleClick(hover || star)}
                onMouseMove={(e) => handleMove(e, star)}
                onMouseLeave={() => setHover(0)}
                className={style.star_span_rate}
              >
                {renderStar(star)}
              </span>
            ))}
          </div>
          <p className={`${style.vote_status} ${style.active}`}>
            Szavazhatsz a receptre ⭐
          </p>
        </div>
      ) : (
        <div className={style.star_container_rate}>
          <StaticStars recipeRating={score} isCard={false} />
          <p className={`${style.vote_status} ${style.disabled}`}>
            Az értékeléshez jelentkezz be{" "}
            <Link className={style.link} href={"/login"}>
              itt!
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
