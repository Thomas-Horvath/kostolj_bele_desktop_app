'use client'
import { useEffect, useState } from "react";
import style from "../../../styles/newrecipe.module.scss"
import { useRouter } from "next/navigation";
import slugify from "../../../../utilities/slugify";
import RecipeForm from "../../../components/recipes/RecipeForm";
import Spinner from "../../../components/ui/Spinner";
import { useDesktopAuth } from "../../../context/DesktopAuthContext";
import recipesClient from "../../../../lib/renderer/api/recipesClient";


const NewRecipe = () => {
    const { status } = useDesktopAuth();
    const router = useRouter();
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    // A recept létrehozása védett funkció, ezért vendég esetén visszairányítunk.
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleSubmit = async ({ name, note, typeParamName, subtypeParamName, ingredients, steps, file }) => {
        try {
            // A RecipeForm csak osszegyujti az adatokat.
            // A tenyleges mentes itt tortenik, mar a desktop recipes kliensen
            // keresztul. A kepfajl is ezen az uton megy at az Electron fele.
            await recipesClient.create({
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
                text: "A recept sikeresen létrejött, átirányítás a receptek oldalára.",
            });
            setTimeout(() => {
                router.push('/receptek');
            }, 450);
        } catch (error) {
            setStatusMessage({
                type: "error",
                text: error instanceof Error
                    ? error.message
                    : "A mentés közben hálózati vagy szerverhiba történt. Próbáld meg újra.",
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


