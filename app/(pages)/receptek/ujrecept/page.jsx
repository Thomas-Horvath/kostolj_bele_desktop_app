'use client'
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import style from "../../../styles/newrecipe.module.scss"
import { useRouter } from "next/navigation";
import slugify from "../../../../utilities/slugify";
import RecipeForm from "../../../components/RecipeForm";
import { useRate } from "../../../context/RateContext";
import Spinner from "../../../components/Spinner";


const NewRecipe = () => {
    const { status } = useSession();
    const router = useRouter();
    const { refreshRecipes } = useRate();
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    // A recept létrehozása védett funkció, ezért vendég esetén visszairányítunk.
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

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

            const res = await fetch("/api/recipes", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setStatusMessage({
                    type: "success",
                    text: "A recept sikeresen létrejött, átirányítás a receptek oldalára.",
                });
                refreshRecipes();
                setTimeout(() => {
                    router.push('/receptek');
                }, 450);
                return;
            }

            const data = await res.json();
            setStatusMessage({
                type: "error",
                text: data.error || "Nem sikerült elmenteni a receptet.",
            });
        } catch (error) {
            setStatusMessage({
                type: "error",
                text: "A mentés közben hálózati vagy szerverhiba történt. Próbáld meg újra.",
            });
        }
    }

    if (status === "loading") {
        return <Spinner />;
    }

    return (
        <section className={style.container}>
            <div className={style.hero}>
                <h1>Új recept létrehozása</h1>
                <p>
                    Itt tudsz teljes értékű receptet felvinni képpel, hozzávalókkal
                    és lépésenkénti elkészítéssel. A mentés után a recept rögtön
                    bekerül a közös listába.
                </p>
            </div>

            <div className={style.content}>
                {statusMessage.text ? (
                    <p className={`${style.status_box} ${statusMessage.type === "error" ? style.status_error : style.status_success}`}>
                        {statusMessage.text}
                    </p>
                ) : null}

                <RecipeForm onSubmit={handleSubmit} submitLabel="Recept mentése" />
            </div>
        </section>
    )
};


export default NewRecipe;


