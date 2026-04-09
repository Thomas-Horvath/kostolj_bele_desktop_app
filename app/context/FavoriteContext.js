"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const FavoritesContext = createContext();

export function FavoriteProvider({ children }) {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState([]);



  useEffect(() => {
    if (!session?.user?.id) {
      setFavorites([]);
      return;
    }
    // Bejelentkezés után egyszer lehúzzuk a mentett kedvenceket,
    // hogy a kártyák szív állapota azonnal a szerver szerinti értéket mutassa.
    fetch("/api/favorites")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nem sikerült lekérni a kedvenceket.");
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("A szerver nem JSON választ adott a kedvencekhez.");
        }

        return res.json();
      })
      .then(data => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => setFavorites([]));
  }, [session]);

  const toggleFavorite = async (recipeId) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });

      if (!res.ok) {
        throw new Error("Nem sikerült menteni a kedvenc állapotot.");
      }

      const data = await res.json();

      if (data.favorited) {
        // Funkcionális state-frissítést használunk, hogy gyors kattintásoknál se
        // vesszen el állapot a lezárt closure miatt.
        setFavorites((prev) => [...new Set([...prev, recipeId])]);
      } else {
        setFavorites((prev) => prev.filter(id => id !== recipeId));
      }
    } catch (err) {
      console.error("Hiba a favorite toggle-nál:", err);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
