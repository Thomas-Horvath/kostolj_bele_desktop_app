// context/RateContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const RateContext = createContext();

export function RateProvider({ children }) {
  const [ratings, setRatings] = useState({});
  const [topEightRecipes, setTopEightRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  // { [recipeId]: score }


  const topRecipes = (recipes) => {
    return (
      recipes
        .filter((r) => r.rate !== null)
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 8)
    )
  }


  async function fetchRecipes() {
    try {
      const res = await fetch("/api/recipes");
      if (!res.ok) {
        throw new Error("Nem sikerült lekérni a recepteket.");
      }
      const data = await res.json();
      setTopEightRecipes(topRecipes(data));
    } catch (err) {
      console.error("Nem sikerült lekérni a recepteket", err);
    } finally {
      setTimeout(() => (
        setLoading(false)
      ), 300)
    }
  }
  // Receptlista lekérése induláskor
  useEffect(() => {
    fetchRecipes();
    // Csak első betöltéskor kérjük le a toplistát. A függvényreferencia figyelése
    // itt felesleges újrafutásokat okozna hot reload és render közben is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Ha a useEffectben ratings-et figyeled, akkor minden szavazásnál újra kellene tölteni az összes 
   * receptet → ez lassú lenne, és sok felesleges adatmozgás.
   * Ha külön útvonal van (/api/recipes/[id]), akkor csak azt az egy receptet kérjük 
   * le újra, amelyik változott → gyorsabb, tisztább, kevesebb adat.
   */



  const updateRating = async (recipeId, newScore) => {
    try {
      // csak az adott receptet kérjük le friss értékkel
      const res = await fetch(`/api/recipes/${recipeId}`);
      if (res.ok) {
        const updated = await res.json();
        setTopEightRecipes(prev =>
          topRecipes([
            ...prev.filter(r => r.id !== recipeId),
            updated
          ])
        );
      }
      // opcionálisan: elmentheted külön is
      setRatings((prev) => ({ ...prev, [recipeId]: newScore }));
    } catch (err) {
      console.error("Nem sikerült frissíteni a recept értékelését", err);
    }
  };

  const refreshRecipes = () => {
    fetchRecipes(); // manuálisan újra lehúzzuk
  };


  return (
    <RateContext.Provider value={{ topEightRecipes, loading, ratings, updateRating, refreshRecipes }}>
      {children}
    </RateContext.Provider>
  );
}

export function useRate() {
  return useContext(RateContext);
}
