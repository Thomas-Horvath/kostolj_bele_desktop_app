'use client'
import { useEffect, useState } from "react";
import style from "../styles/newrecipe.module.scss";
import clsx from "clsx";
import {
    CATEGORY_DEFINITIONS,
    INGREDIENT_SUGGESTIONS,
    MEASUREMENT_UNITS,
    canonicalizeMeasurementUnit,
} from "../../lib/recipeOptions";
import {
    MAX_RECIPE_IMAGE_SIZE_BYTES,
    RECIPE_IMAGE_TYPE_LABEL,
    SUPPORTED_RECIPE_IMAGE_TYPES,
} from "../../lib/recipeImageConfig";

export default function RecipeForm({ initialData, onSubmit, submitLabel = "Küldés" }) {
    const [name, setName] = useState("");
    const [note, setNote] = useState("");
    const [typeParamName, setTypeParamName] = useState("");
    const [formError, setFormError] = useState("");
    const [ingredients, setIngredients] = useState([
        {
            name: "",
            amount: "",
            unit: "",
        }
    ]);
    const [steps, setSteps] = useState([
        {
            timer: "",
            content: "",
        }
    ]);
    const [fieldErrors, setFieldErrors] = useState({});

    function getFieldError(fieldName) {
        return fieldErrors[fieldName] || "";
    }

    function clearSingleFieldError(fieldName) {
        setFieldErrors((prev) => {
            if (!prev[fieldName]) {
                return prev;
            }

            const next = { ...prev };
            delete next[fieldName];
            return next;
        });
    }

    // A kötelező mezőket saját validációval ellenőrizzük, hogy a felhasználó
    // közvetlenül a hibás mező alatt kapjon egyértelmű magyar visszajelzést.
    function validateForm(file) {
        const nextErrors = {};

        if (!name.trim()) {
            nextErrors.name = "A recept neve kötelező.";
        }

        if (!typeParamName) {
            nextErrors.typeParamName = "A kategória kiválasztása kötelező.";
        }

        ingredients.forEach((ingredient, index) => {
            if (!ingredient.name.trim()) {
                nextErrors[`ingredient-name-${index}`] = "A hozzávaló neve kötelező.";
            }

            if (!ingredient.amount.trim()) {
                nextErrors[`ingredient-amount-${index}`] = "A mennyiség megadása kötelező.";
            }

            if (!ingredient.unit) {
                nextErrors[`ingredient-unit-${index}`] = "A mértékegység kiválasztása kötelező.";
            }
        });

        steps.forEach((step, index) => {
            if (!step.content.trim()) {
                nextErrors[`step-content-${index}`] = "A lépés leírása kötelező.";
            }

            if (!String(step.timer).trim()) {
                nextErrors[`step-timer-${index}`] = "Az idő megadása kötelező.";
            }
        });

        const shouldRequireFile = !initialData?.imageURL;
        if (shouldRequireFile && !file) {
            nextErrors.image = "Új recepthez kép feltöltése kötelező.";
        }

        if (file) {
            if (!SUPPORTED_RECIPE_IMAGE_TYPES.includes(file.type)) {
                nextErrors.image = `Csak ${RECIPE_IMAGE_TYPE_LABEL} formátumú képet tölthetsz fel.`;
            } else if (file.size > MAX_RECIPE_IMAGE_SIZE_BYTES) {
                nextErrors.image = "A feltöltött kép túl nagy. A maximális méret 8 MB.";
            }
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    // Ha szerkesztés történik, a meglévő adatokat előre betöltjük a formba.
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || "");
            setNote(initialData.note || "");
            setTypeParamName(initialData.type?.paramName || "");
            // ingredients: [{ name, amount, unit }]
            if (Array.isArray(initialData.ingredients) && initialData.ingredients.length) {
                setIngredients(
                    initialData.ingredients.map(({ name = "", amount = "", unit = "" }) => ({
                        name,
                        amount: amount === null || amount === undefined ? "" : String(amount),
                        unit: canonicalizeMeasurementUnit(unit),
                    }))
                );
            } else {
                setIngredients([{ name: "", amount: "", unit: "" }]);
            }

            // steps: [{ timer, content }]
            if (Array.isArray(initialData.steps) && initialData.steps.length) {
                setSteps(
                    initialData.steps.map(({ timer = "", content = "" }) => ({
                        // ha szám jön a DB-ből, alakítsuk stringgé az inputhoz
                        timer: timer === null || timer === undefined ? "" : String(timer),
                        content,
                    }))
                );
            } else {
                setSteps([{ timer: "", content: "" }]);
            }
        }
    }, [initialData]);


    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        const file = e.target.elements["img-url"].files[0];

        if (!validateForm(file)) {
            setFormError("Kérlek javítsd a pirossal jelölt mezőket.");
            return;
        }

        // A külső submit kezeli az API-hívást, a form komponens pedig csak az adatgyűjtésért felel.
        await onSubmit({ name, note, typeParamName, ingredients, steps, file });
    }


    return (
        <form className={style.form} onSubmit={handleSubmit} noValidate>
            {formError ? <p className={style.form_feedback_error}>{formError}</p> : null}

            <div className={style.field_group}>
                <h2>Név</h2>
                <p className={style.helper_text}>
                    Adj meg egy rövid, jól felismerhető nevet, ami alapján később is könnyű lesz rákeresni.
                </p>
                <div className={style.row}>
                    <input type="text" name="name"
                        className={clsx({ [style.field_error]: Boolean(getFieldError("name")) })}
                        value={name}
                        placeholder="Például: Házi almás pite"
                        onChange={(e) => {
                            setName(e.target.value);
                            if (e.target.value.trim()) {
                                clearSingleFieldError("name");
                            }
                        }}
                    />
                    {getFieldError("name") ? <p className={style.field_error_text}>{getFieldError("name")}</p> : null}
                </div>
            </div>

            <div className={style.field_group}>
                <h2>Megjegyzés</h2>
                <p className={style.helper_text}>
                    Ide írhatsz egy rövid tippet, tálalási ötletet vagy bármi hasznos feljegyzést a recepthez.
                </p>
                <div className={style.row}>
                    <textarea
                        name="note"
                        className={style.full_width_input}
                        value={note}
                        rows={4}
                        placeholder="Például: Másnap még finomabb, hűtőben 2 napig eláll."
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
            </div>

            <div className={style.field_group}>
                <h2>Típus</h2>
                <p className={style.helper_text}>
                    Válassz olyan kategóriát, ami a legjobban illik a recept fő jellegéhez.
                </p>
                <select
                    value={typeParamName}
                    name="type"
                    className={clsx({ [style.field_error]: Boolean(getFieldError("typeParamName")) })}
                    onChange={(e) => {
                        setTypeParamName(e.target.value);
                        if (e.target.value) {
                            clearSingleFieldError("typeParamName");
                        }
                    }}

                >
                    <option value="" disabled>
                        Típus
                    </option>
                    {CATEGORY_DEFINITIONS.map((category) => (
                        <option key={category.paramName} value={category.paramName}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {getFieldError("typeParamName") ? <p className={style.field_error_text}>{getFieldError("typeParamName")}</p> : null}
            </div>


            <div className={style.field_group}>
                <h2>Hozzávalók</h2>
                <p className={style.helper_text}>
                    Minden hozzávalót külön sorban adj meg. Így a recept később is jól áttekinthető marad.
                </p>

                {ingredients.map((ingredient, i) => (
                    <div key={i} className={`${style.row} ${style.item_card}`}>
                        <div className={style.item_header}>
                            <h3>{i + 1}. hozzávaló</h3>
                        </div>

                        <input
                            type="text"
                            list="ingredient-suggestions"
                            name={"ingredient-name-" + i}
                            className={clsx(style.full_width_input, {
                                [style.field_error]: Boolean(getFieldError(`ingredient-name-${i}`)),
                            })}
                            placeholder="Például: liszt, rizs, tej, fokhagyma"
                            value={ingredient.name}
                            onChange={(e) => {
                                setIngredients((prev) => {
                                    const next = [...prev];
                                    next[i].name = e.target.value;
                                    return next;
                                });
                                if (e.target.value.trim()) {
                                    clearSingleFieldError(`ingredient-name-${i}`);
                                }
                            }}
                        />
                        {getFieldError(`ingredient-name-${i}`) ? <p className={style.field_error_text}>{getFieldError(`ingredient-name-${i}`)}</p> : null}

                        <div className={style.sub_row}>
                            <input
                                type="text"
                                inputMode="decimal"
                                name={"ingredient-amount-" + i}
                                className={clsx({ [style.field_error]: Boolean(getFieldError(`ingredient-amount-${i}`)) })}
                                placeholder="Mennyiség"
                                value={ingredient.amount}
                                onChange={(e) => {
                                    setIngredients((prev) => {
                                        const next = [...prev];
                                        next[i].amount = e.target.value;
                                        return next;
                                    });
                                    if (e.target.value.trim()) {
                                        clearSingleFieldError(`ingredient-amount-${i}`);
                                    }
                                }}
                            />

                            <select
                                value={ingredient.unit}
                                name={"ingredient-unit-" + i}
                                className={clsx({ [style.field_error]: Boolean(getFieldError(`ingredient-unit-${i}`)) })}
                                onChange={(e) => {
                                    setIngredients((prev) => {
                                        const next = [...prev];
                                        next[i].unit = e.target.value;
                                        return next;
                                    });
                                    if (e.target.value) {
                                        clearSingleFieldError(`ingredient-unit-${i}`);
                                    }
                                }}
                            >
                                <option value="" disabled>
                                    Mértékegység
                                </option>
                                {MEASUREMENT_UNITS.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                className={clsx("btn-orange", style.btn)}
                                type="button"
                                onClick={() => {
                                    setIngredients((prev) => {
                                        const next = prev.slice();
                                        next.splice(i, 1)
                                        return next;
                                    })
                                }
                                }
                            >
                                Törlés
                            </button>
                        </div>
                        {(getFieldError(`ingredient-amount-${i}`) || getFieldError(`ingredient-unit-${i}`)) ? (
                            <div className={style.sub_row_errors}>
                                <div>
                                    {getFieldError(`ingredient-amount-${i}`) ? <p className={style.field_error_text}>{getFieldError(`ingredient-amount-${i}`)}</p> : null}
                                </div>
                                <div>
                                    {getFieldError(`ingredient-unit-${i}`) ? <p className={style.field_error_text}>{getFieldError(`ingredient-unit-${i}`)}</p> : null}
                                </div>
                                <div />
                            </div>
                        ) : null}
                    </div>
                ))}
                <div className={style.plus_btn}>
                    <button
                        type="button"
                        className="btn-green"
                        onClick={() => {
                            setIngredients((prev) => {
                                return [
                                    ...prev, {
                                        name: "",
                                        amount: "",
                                        unit: "",
                                    }
                                ]
                            })
                        }}
                    >
                        Új hozzávaló hozzáadása
                    </button>
                </div>
            </div>




            <div className={style.field_group}>
                <h2>Elkészítés</h2>
                <p className={style.helper_text}>
                    A lépésekhez nyugodtan írj hosszabb leírást is. Minden fontos instrukció külön lépésben legyen.
                </p>
                {
                    steps.map((step, i) => (
                        <div key={i} className={`${style.row} ${style.step_row}`}>
                            <div className={style.item_header}>
                                <h3>{i + 1}. lépés</h3>
                            </div>

                            <textarea
                                name={"step-content-" + i}
                                className={clsx(style.full_width_input, {
                                    [style.field_error]: Boolean(getFieldError(`step-content-${i}`)),
                                })}
                                placeholder="Írd le részletesen, mit kell csinálni ebben a lépésben..."
                                value={step.content}
                                rows={4}
                                onChange={(e) => {
                                    setSteps((prev) => {
                                        const next = [...prev];
                                        next[i].content = e.target.value;
                                        return next;
                                    });
                                    if (e.target.value.trim()) {
                                        clearSingleFieldError(`step-content-${i}`);
                                    }

                                }}
                            ></textarea>
                            {getFieldError(`step-content-${i}`) ? <p className={style.field_error_text}>{getFieldError(`step-content-${i}`)}</p> : null}

                            <div className={style.sub_row}>
                                <input
                                    type="number"
                                    name={"step-timer-" + i}
                                    className={clsx({ [style.field_error]: Boolean(getFieldError(`step-timer-${i}`)) })}
                                    placeholder="Idő percben"
                                    min={1}
                                    value={step.timer}
                                    onChange={(e) => {
                                        setSteps((prev) => {
                                            const next = [...prev];
                                            next[i].timer = e.target.value;
                                            return next;
                                        });
                                        if (String(e.target.value).trim()) {
                                            clearSingleFieldError(`step-timer-${i}`);
                                        }

                                    }}
                                />

                                <button
                                    className={clsx("btn-orange", style.btn)}
                                    type="button"
                                    onClick={() => {
                                        setSteps((prev) => {
                                            const next = prev.slice();
                                            next.splice(i, 1)
                                            return next;
                                        });
                                    }}
                                >
                                    Törlés
                                </button>
                            </div>
                            {getFieldError(`step-timer-${i}`) ? (
                                <div className={style.sub_row_errors}>
                                    <div>
                                        <p className={style.field_error_text}>{getFieldError(`step-timer-${i}`)}</p>
                                    </div>
                                    <div />
                                </div>
                            ) : null}
                        </div>

                    ))
                }

                <div className={style.plus_btn}>
                    <button
                        type="button"
                        className="btn-green"
                        onClick={() => {
                            setSteps(prev => {
                                return [
                                    ...prev,
                                    {
                                        timer: "",
                                        content: "",
                                    }
                                ]
                            })
                        }}
                    >
                        Új lépés hozzáadása
                    </button>
                </div>

            </div>





            <div className={style.field_group}>
                <h2>Kép</h2>
                <p className={style.helper_text}>
                    Érdemes álló vagy fekvő, jó minőségű ételfotót feltölteni, mert ez jelenik meg a receptlistában is.
                </p>
                <div className={`${style.row} ${style.media_row}`}>
                    <input
                        type="file"
                        name="img-url"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className={clsx(style.file_input, {
                            [style.field_error]: Boolean(getFieldError("image")),
                        })}
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                clearSingleFieldError("image");
                            }
                        }}
                    />
                    <i>
                        {initialData?.imageURL
                            ? "Ha új képet választasz, a régi le lesz cserélve."
                            : "Új recepthez legalább egy kép feltöltése kötelező."}
                    </i>
                    <i>Engedélyezett formátumok: {RECIPE_IMAGE_TYPE_LABEL}. Max. 8 MB.</i>
                    {getFieldError("image") ? <p className={style.field_error_text}>{getFieldError("image")}</p> : null}
                </div>
            </div>





            <button type="submit" className="btn-orange">{submitLabel}</button>

            <datalist id="ingredient-suggestions">
                {INGREDIENT_SUGGESTIONS.map((ingredientName) => (
                    <option key={ingredientName} value={ingredientName} />
                ))}
            </datalist>

        </form>
    )
}
