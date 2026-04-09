"use client";
import { useState } from "react";

import { useSession } from "next-auth/react";
import StaticStars from "./StaticStars";
import style from '../styles/recipeRateStars.module.scss';
import { getStarIcon } from "./getStarIcon";
import Link from "next/link";
import { useRate } from "../context/RateContext";

export default function RateRecipe({ recipeId, initialScore }) {
    const { data: session } = useSession();

    const [hover, setHover] = useState(0);
    const { ratings, updateRating } = useRate();

    const score = ratings[recipeId] ?? initialScore;


    const handleClick = async (value) => {


        const res = await fetch("/api/rating", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId, score: value }),
        });
        if (res.ok) {
            const data = await res.json();
            updateRating(recipeId, data.average); // itt frissíted a state-et a valós átlaggal
        }
    };

    const handleMove = (e, star) => {
        if (!session) return;
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left; // egér pozíciója a csillagban
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

            {session ? (
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
