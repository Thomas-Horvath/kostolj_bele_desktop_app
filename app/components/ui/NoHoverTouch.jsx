"use client";

import { useEffect } from "react";

export default function NoHoverTouch() {
  useEffect(() => {
    const handleTouchStart = () => {
      // Erintos eszkoznel nincs ertelme a klasszikus hover allapotoknak,
      // ezért az elso touch utan rakjuk ra a body-ra a no-hover osztalyt.
      document.body.classList.add("no-hover");
      window.removeEventListener("touchstart", handleTouchStart);
    };

    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  return null;
}
