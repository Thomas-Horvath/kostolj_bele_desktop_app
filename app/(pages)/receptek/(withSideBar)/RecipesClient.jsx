"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "../../../styles/recipes.module.scss";
import RecipeCard from "../../../components/recipes/RecipeCard";
import RecipeCardSkeleton from "../../../components/recipes/RecipeCardSkeleton";
import recipesClient from "../../../../lib/renderer/api/recipesClient";
import Spinner from "../../../components/ui/Spinner";
import { useDesktopAuth } from "../../../context/DesktopAuthContext";

function getCurrentTypeFromPath(pathname) {
  if (!pathname?.startsWith("/receptek/kategoria/")) {
    return "";
  }

  const [, , , typeParamName] = pathname.split("/");
  return typeParamName || "";
}

export default function RecipesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useDesktopAuth();
  const searchParams = useSearchParams();
  const currentType = getCurrentTypeFromPath(pathname);
  const currentSubtype = searchParams.get("subtype") || "";
  const currentQuery = searchParams.get("q") || "";

  const [viewState, setViewState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== "authenticated") {
      setViewState(null);
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    let isMounted = true;

    async function loadView() {
      try {
        setPageError("");

        // Az elso betolteskor normal skeleton jelenik meg.
        // Utana mar nem akarjuk ujra "szetszedni" a jobb oldali panelt,
        // mert a kategoriavaltasnal ez villogo, idegesito UX-et okoz.
        if (!hasLoadedOnceRef.current) {
          setLoading(true);
        } else {
          setIsRefreshing(true);
        }

        if (currentType) {
          // A kategoriak es az alkategoriak egy kozos, perzisztens komponensben
          // frissulnek. Ettol a layout nem remountol minden route-valtasnal.
          const [categoryData, types] = await Promise.all([
            recipesClient.getByCategory({ type: currentType, subtype: currentSubtype }),
            recipesClient.listTypes(),
          ]);

          const typeMeta = Array.isArray(types)
            ? types.find((typeItem) => typeItem.paramName === currentType) || null
            : null;

          const subtypes = Array.isArray(typeMeta?.subtypes)
            ? typeMeta.subtypes
            : Array.isArray(categoryData?.type?.subtypes)
              ? categoryData.type.subtypes
              : [];

          if (isMounted) {
            setViewState({
              mode: "category",
              title: categoryData.type.name,
              activeSubtypeLabel: categoryData.activeSubtype?.name || "",
              recipes: Array.isArray(categoryData.recipes) ? categoryData.recipes : [],
              typeParamName: categoryData.type.paramName,
              activeSubtypeParamName: categoryData.activeSubtype?.paramName || "",
              subtypes,
            });
          }
        } else {
          const recipes = await recipesClient.list(currentQuery);

          if (isMounted) {
            setViewState({
              mode: "list",
              title: currentQuery ? `Keresési találatok: "${currentQuery}"` : "Receptek",
              query: currentQuery,
              recipes: Array.isArray(recipes) ? recipes : [],
            });
          }
        }

        if (isMounted) {
          hasLoadedOnceRef.current = true;
        }
      } catch (error) {
        if (isMounted) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Nem sikerült betölteni a recepteket."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadView();

    return () => {
      isMounted = false;
    };
  }, [currentQuery, currentSubtype, currentType, router, status]);

  if (status !== "authenticated") {
    return <Spinner />;
  }

  if (pageError && !viewState) {
    return (
      <div className={styles.container}>
        <div className={styles.main_container}>
          <h1 className={styles.main_title}>Nem sikerült betölteni a recepteket</h1>
          <p>{pageError}</p>
        </div>
      </div>
    );
  }

  const recipes = Array.isArray(viewState?.recipes) ? viewState.recipes : [];
  const isCategoryView = viewState?.mode === "category";
  const visibleTitle = isCategoryView
    ? `${viewState?.title || ""}${viewState?.activeSubtypeLabel ? ` / ${viewState.activeSubtypeLabel}` : ""}`
    : viewState?.title || "Receptek";
  const subtypes = Array.isArray(viewState?.subtypes) ? viewState.subtypes : [];

  return (
    <div className={styles.container}>
      <div className={styles.main_container}>
        <div className={styles.title_row}>
          {isCategoryView ? (
            <p className={styles.section_eyebrow}>Kategória nézet</p>
          ) : null}

          <h1 className={styles.main_title}>{visibleTitle}</h1>

          {isCategoryView && subtypes.length ? (
            <div className={`${styles.filter_block} ${styles.title_filter_block}`}>
              <div className={styles.filter_header}>
                <p className={styles.filter_eyebrow}>Alkategóriák</p>
              </div>
              <div className={styles.filter_bar}>
                <button
                  type="button"
                  onClick={() => router.push(`/receptek/kategoria/${viewState.typeParamName}`)}
                  className={`${styles.filter_chip} ${!viewState.activeSubtypeParamName ? styles.filter_chip_active : ""}`}
                >
                  Összes
                </button>
                {subtypes.map((subtypeItem) => {
                  const isActive = viewState.activeSubtypeParamName === subtypeItem.paramName;

                  return (
                    <button
                      key={subtypeItem.paramName}
                      type="button"
                      onClick={() =>
                        router.push(
                          `/receptek/kategoria/${viewState.typeParamName}?subtype=${subtypeItem.paramName}`
                        )
                      }
                      className={`${styles.filter_chip} ${isActive ? styles.filter_chip_active : ""}`}
                    >
                      {subtypeItem.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {!isCategoryView && viewState?.query ? (
            <p className={styles.result_summary}>
              {recipes.length} találat név, kategória vagy alkategória alapján
            </p>
          ) : null}
        </div>
        <div
          className={`${styles.card_container} ${isRefreshing ? styles.card_container_refreshing : ""}`}
        >
          {loading && !hasLoadedOnceRef.current
            ? Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
            : recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
        {!loading && !isRefreshing && recipes.length === 0 ? (
          <div className={styles.empty_state}>
            <h2>Nincs találat</h2>
            <p>
              {isCategoryView
                ? "Ebben a kategóriában vagy alkategóriában még nincs recept."
                : "Próbálj meg más receptnevet, kategóriát vagy alkategóriát keresni, például: húsételek, csirke, desszertek, krémlevesek."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
