"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./styles/home.module.scss";
import Spinner from "./components/ui/Spinner";
import { useDesktopAuth } from "./context/DesktopAuthContext";

export default function Home() {
  const router = useRouter();
  const { status, isAuthenticated } = useDesktopAuth();

  useEffect(() => {
    if (status === "authenticated" && isAuthenticated) {
      router.replace("/profil");
    }
  }, [isAuthenticated, router, status]);

  if (status === "loading") {
    return <Spinner />;
  }

  if (isAuthenticated) {
    return <Spinner />;
  }

  return (
    <section className={styles.home}>
      <div className={styles.guestHero}>
        <Image
          className={styles.guestBanner}
          src="/banner6.webp"
          alt="Kóstolj Bele! főoldali banner"
          width={2200}
          height={1200}
          sizes="100vw"
          priority
        />
        <div className={styles.guestOverlay} />
        <div className={styles.guestContent}>
          <p className={styles.eyebrow}>Asztali receptgyűjtemény</p>
          <h1>Kóstolj Bele!</h1>
          <p className={styles.lead}>A saját receptjeid egy helyen!</p>
          <Link href="/login" className="btn-orange">
            Bejelentkezés
          </Link>
        </div>
      </div>
    </section>
  );
}
