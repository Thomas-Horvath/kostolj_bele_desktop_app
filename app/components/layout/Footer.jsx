import React from "react";
import styles from "../../styles/footer.module.scss";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  // A desktop verzio footerje mar nem egy "mini weboldal".
  // Tudatosan elhagytuk:
  // - a segitseg/linkek/rolunk blokkokat
  // - a social ikonokat
  // - a marketing jellegu tartalmakat
  //
  // A cel egy diszkret, alkalmazasszeru also sav, ami csak az alap brandet
  // es a copyright sort tartja meg.

  return (
    <footer className={styles.footer}>
      <Link href="/" className={styles.logo_group}>
        <Image
          className={styles.logo}
          src="/logo.svg"
          alt="Kóstolj Bele logó"
          width={36}
          height={36}
        />
        <span className={styles.brand_name}>Kóstolj Bele!</span>
      </Link>

      <p className={styles.copyright}>Copyright &copy; 2026 Thomas Horvath</p>
    </footer>
  );
};

export default Footer;

