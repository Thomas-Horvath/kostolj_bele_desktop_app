"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useDesktopAuth } from "./DesktopAuthContext";
import favoritesClient from "../../lib/renderer/api/favoritesClient";

const FavoritesContext = createContext();

export function FavoriteProvider({ children }) {
  const { user, status } = useDesktopAuth();
  const [favorites, setFavorites] = useState([]);



  useEffect(() => {
    if (status !== "authenticated" || !user?.id) {
      setFavorites([]);
      return;
    }
    // Bejelentkezés után egyszer lehúzzuk a mentett kedvenceket.
    // A React context már nem /api endpointot hív, hanem a desktop favorites klienst.
    favoritesClient
      .list()
      .then(data => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => setFavorites([]));
  }, [status, user?.id]);

  const toggleFavorite = async (recipeId) => {
    try {
      const data = await favoritesClient.toggle(recipeId);

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
