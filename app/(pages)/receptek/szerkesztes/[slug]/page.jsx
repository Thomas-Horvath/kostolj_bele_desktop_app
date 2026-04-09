'use client';
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import RecipeForm from "../../../../components/RecipeForm";
import slugify from "../../../../../utilities/slugify";
import style from "../../../../styles/newrecipe.module.scss";
import Spinner from "../../../../components/Spinner";

export default function EditRecipePage() {
    const { status } = useSession();
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
                const res = await fetch(`/api/editrecipes/${slug}`, { method: "GET" });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Nem sikerült betölteni a receptet.");
                }

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


    const handleSubmit = async ({ name, note, typeParamName, ingredients, steps, file }) => {
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("note", note);
            formData.append("slug", slugify(name));
            formData.append("typeParamName", typeParamName);
            formData.append("ingredients", JSON.stringify(ingredients));
            formData.append("steps", JSON.stringify(steps));
            if (file) {
                formData.append("image", file);
            }

            const res = await fetch(`/api/recipes/${initialData.id}`, {
                method: "PUT",
                body: formData,
            });

            if (res.ok) {
                setStatusMessage({
                    type: "success",
                    text: "A recept módosítása sikerült, átirányítás a receptek oldalára.",
                });
                setTimeout(() => {
                    router.push('/receptek');
                }, 450)
                return;
            }

            const data = await res.json();
            setStatusMessage({
                type: "error",
                text: data.error || "Nem sikerült módosítani a receptet.",
            });
        } catch (error) {
            setStatusMessage({
                type: "error",
                text: "A mentés közben hálózati vagy szerverhiba történt. Próbáld meg újra.",
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
