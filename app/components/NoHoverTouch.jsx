"use client";
import { useEffect } from "react";

export default function NoHoverTouch() {
  useEffect(() => {
    const handleTouchStart = () => {
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
