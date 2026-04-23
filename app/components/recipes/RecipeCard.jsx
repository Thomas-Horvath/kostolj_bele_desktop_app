'use client';

import styles from '../../styles/recipeCard.module.scss';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';
import StaticStars from '../ui/StaticStars';
import { useRate } from "../../context/RateContext";
import { getRecipeImageSrc } from "../../../lib/recipeImageUrl";

const RecipeCard = ({ recipe }) => {
    const imageUrl = getRecipeImageSrc(recipe.imageURL);
    const { ratings } = useRate();
    const score = ratings[recipe.id] ?? recipe.rate;

    return (
        (<div className={styles.card}>

            <FavoriteButton recipeId={recipe.id} />
            <Link href={`/receptek/${recipe.slug}`} >
                <div className={styles.img_container}>
                    {/* Electron alatt a receptkepek `kb-image://` URL-en jonnek.
                        Ehhez a sima HTML img stabilabb, mint a Next kepoptimalizalo. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={recipe.name} className={styles.image} />
                </div>
                <div className={styles.content_container}>
                    <div className={styles.rate_container}>
                        <div className={styles.starsWrapper}>
                            <StaticStars recipeRating={score} isCard={true} />
                        </div>
                        <p>{score ? score.toFixed(1) : "0.0"}</p>

                    </div>
                    <h2 className={styles.title}>{recipe.name}</h2>
                </div>
            </Link>
        </div>)
    );
};

export default RecipeCard;
