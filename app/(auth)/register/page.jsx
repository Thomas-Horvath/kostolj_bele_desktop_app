"use client";

import Link from "next/link";
import styles from '../../styles/login.module.scss';

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h1>Felhasználó létrehozása</h1>
        <p className={styles.info_text}>
          A publikus regisztráció ki lett vezetve.
        </p>
        <p className={styles.info_text}>
          Új felhasználót csak a fő admin tud létrehozni a profiloldalról.
        </p>
        <Link href="/login" className="btn-green">
          Bejelentkezés
        </Link>
      </div>
    </div>
  );
}
