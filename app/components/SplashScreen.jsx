"use client";
import { useEffect, useState } from "react";
import styles from "../styles/splashScreen.module.scss";
import Spinner from "./Spinner.jsx";

export default function SplashScreen({ children, delay = 150 }) {
  const [hiding, setHiding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // A splash screen csak az első valódi oldalbetöltéskor jelenjen meg.
    // Kliensoldali navigációnál, például keresés vagy kategóriaváltás közben,
    // már ne takarja le az egész alkalmazást.
    const hasSeenSplash = window.sessionStorage.getItem("hasSeenSplashScreen");

    if (hasSeenSplash) {
      setMounted(false);
      return;
    }

    setMounted(true);

    const timer = setTimeout(() => {
      setHiding(true); // indítjuk a fade-out animációt
      // animáció ideje = 500ms → utána töröljük
      setTimeout(() => {
        window.sessionStorage.setItem("hasSeenSplashScreen", "true");
        setMounted(false);
      }, 500);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <>
      {children}
      {mounted && (
        <div
          className={`${styles.splash} ${hiding ? styles.fadeOut : ""}`}
        >
          <Spinner />
        </div>
      )}
    </>
  );
}
