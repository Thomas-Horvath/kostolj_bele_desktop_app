"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/header.module.scss';
import Image from 'next/image';
import { RiMenu5Line } from "react-icons/ri";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useSession, signOut } from "next-auth/react";


const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const isAuthenticated = Boolean(session?.user?.id);


    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleSignOut = async () => {
        setIsOpen(false);

        const callbackUrl =
            typeof window !== "undefined" ? `${window.location.origin}/` : "/";

        await signOut({ callbackUrl });
    };

    return (
        <header className={styles.header}>

            <div className={styles.header_wrapper}>
                <Link href='/' className={styles.logo_group} onClick={() => setIsOpen(false)}>
                    <Image
                        className={styles.logo}
                        src="/logo.svg"  // Kép útvonala a public mappában
                        alt="logo"    // Kép leírása
                        width={35}        // Kép szélessége pixelben
                        height={35}
                    />
                    <span className={styles.span}>Kóstolj Bele!</span>
                </Link>
                <nav className={`${styles.nav} ${isOpen ? styles.open : ""}`}>
                    <Link href="/" onClick={() => setIsOpen(false)}>Főoldal</Link>
                    <Link href="/receptek" onClick={() => setIsOpen(false)}>Receptek</Link>
                    {isAuthenticated ? (
                        <>
                            <Link href="/receptek/ujrecept" className={styles.newrecipe} onClick={() => setIsOpen(false)}>Új recept</Link>
                            <Link href="/profil" className={styles.profil} onClick={() => setIsOpen(false)}>Profil</Link>
                            <button className={styles.logout_btn} onClick={handleSignOut}>Kijelentkezés</button>
                        </>
                    ) : (
                        <>
                            {/* A publikus regisztráció megszűnt, ezért csak a bejelentkezés maradt a fejlécben. */}
                            <Link href="/login" onClick={() => setIsOpen(false)}>Bejelentkezés</Link>
                        </>
                    )}



                </nav>
                {isOpen ?
                    <IoCloseCircleOutline className={styles.hamburger_icon} onClick={toggleMenu} />
                    :
                    <RiMenu5Line className={styles.hamburger_icon} onClick={toggleMenu} />
                }
            </div>
        </header>
    );
};

export default Header;
