"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../styles/header.module.scss";
import Image from "next/image";
import { RiMenu5Line } from "react-icons/ri";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useDesktopAuth } from "../../context/DesktopAuthContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout, status } = useDesktopAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await logout();
    router.replace("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.header_wrapper}>
        <Link href="/" className={styles.logo_group} onClick={() => setIsOpen(false)}>
          <Image
            className={styles.logo}
            src="/logo.svg"
            alt="logo"
            width={35}
            height={35}
          />
          <span className={styles.span}>Kóstolj Bele!</span>
        </Link>
        <nav className={`${styles.nav} ${isOpen ? styles.open : ""}`}>
          {status === "loading" ? null : isAuthenticated ? (
            <>
              <Link
                href="/profil"
                className={styles.profil}
                onClick={() => setIsOpen(false)}
              >
                Profil
              </Link>
              <Link href="/receptek" onClick={() => setIsOpen(false)}>
                Receptek
              </Link>
              <Link
                href="/receptek/ujrecept"
                className={styles.newrecipe}
                onClick={() => setIsOpen(false)}
              >
                Új recept
              </Link>
              <button className={styles.logout_btn} onClick={handleSignOut}>
                Kijelentkezés
              </button>
            </>
          ) : (
            <>
              <Link href="/" onClick={() => setIsOpen(false)}>
                Főoldal
              </Link>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                Bejelentkezés
              </Link>
            </>
          )}
        </nav>
        {isOpen ? (
          <IoCloseCircleOutline className={styles.hamburger_icon} onClick={toggleMenu} />
        ) : (
          <RiMenu5Line className={styles.hamburger_icon} onClick={toggleMenu} />
        )}
      </div>
    </header>
  );
};

export default Header;
