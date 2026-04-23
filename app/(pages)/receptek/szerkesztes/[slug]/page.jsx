'use client';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RecipeForm from "../../../../components/recipes/RecipeForm";
import slugify from "../../../../../utilities/slugify";
import style from "../../../../styles/newrecipe.module.scss";
import Spinner from "../../../../components/ui/Spinner";
import { useDesktopAuth } from "../../../../context/DesktopAuthContext";
import recipesClient from "../../../../../lib/renderer/api/recipesClient";

export default function EditRecipePage() {
    const { status } = useDesktopAuth();
    const router = useRouter();
    const params = useParams();
    const slug = typeof params?.slug === "string" ? params.slug : "";

    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        async function loadRecipe() {
            try {
                setLoading(true);
                // A szerkesztő kezdőadata most már a recipes kliensen keresztül érkezik,
                // így a GET betöltés nem a régi route fetch logikára támaszkodik.
                const data = await recipesClient.getEditableBySlug(slug);
                setInitialData(data);
            } catch (err) {
                setPageError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated" && slug) {
            loadRecipe();
        }
    }, [router, slug, status]);


    const handleSubmit = async ({ name, note, typeParamName, subtypeParamName, ingredients, steps, file }) => {
        try {
            // A modositasi payload ugyanazon a desktop recipes kliensen megy at,
            // mint a letrehozas. Ha uj kep is jon, azt a backend cserekkent kezeli:
            // uj kep mentese + regi kep torlese.
            await recipesClient.update({
                id: initialData.id,
                name,
                note,
                slug: slugify(name),
                typeParamName,
                subtypeParamName,
                ingredients,
                steps,
                file,
            });

            setStatusMessage({
                type: "success",
                text: "A recept módosítása sikerült, átirányítás a receptek oldalára.",
            });
            setTimeout(() => {
                router.push('/receptek');
            }, 450)
        } catch (error) {
            setStatusMessage({
                type: "error",
                text: error instanceof Error
                    ? error.message
                    : "A mentés közben hálózati vagy szerverhiba történt. Próbáld meg újra.",
            });
        }
    }

    if (loading || status === "loading") return <Spinner />;

    if (pageError) {
        return (
            <section className={style.container}>
                <div className={style.hero}>
                    <h1>Recept szerkesztése</h1>
                    <p>Az oldal csak akkor nyílik meg, ha van jogosultságod az adott recepthez.</p>
                </div>
                <div className={style.content}>
                    <p className={`${style.status_box} ${style.status_error}`}>{pageError}</p>
                </div>
            </section>
        );
    }

    return (
        <section className={style.container}>
            <div className={style.hero}>
                <h1>{initialData.name} szerkesztése</h1>
                <p>
                    Itt tudod frissíteni a recept szövegét, lépéseit és a hozzá tartozó képet.
                </p>
            </div>
            <div className={style.content}>
                {statusMessage.text ? (
                    <p className={`${style.status_box} ${statusMessage.type === "error" ? style.status_error : style.status_success}`}>
                        {statusMessage.text}
                    </p>
                ) : null}
                <RecipeForm initialData={initialData} onSubmit={handleSubmit} submitLabel="Módosítás mentése" />
            </div>
        </section>
    )
}
