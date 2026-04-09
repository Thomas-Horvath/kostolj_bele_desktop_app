import React from 'react';
import styles from '../styles/footer.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {


    return (
        <div className={styles.footer}>
            <div className={styles.content_wrapper}>

                <div className={styles.link_group}>
                    <div className={styles.links}>
                        <div className={styles.links_content_wrapper}>
                            <h2>Segítség</h2>
                            <ul>
                                <li><Link href='/segitseg/gyik'>GYIK (Gyakori Kérdések)</Link></li>
                                <li><Link href='/segitseg/tamogatas'>Támogatás</Link></li>
                                <li><Link href='/segitseg/kapcsolat'>Kapcsolatfelvétel</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.links}>
                        <div className={styles.links_content_wrapper}>

                            <h2>Linkek</h2>
                            <ul>
                                <li><Link href='/linkek/felhasznalasi-feltetelek'>Felhasználási feltételek</Link></li>
                                <li><Link href='/linkek/adatvedelmi-iranyelvek'>Adatvédelmi irányelvek</Link></li>
                                <li><Link href='/receptek'>Receptjeink</Link></li>
                                <li><Link href='/linkek/blog'>Blog</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.links}>
                        <div className={styles.links_content_wrapper}>
                            <h2>Rólunk</h2>
                            <ul>
                                <li><Link href='/rolunk/cegunkrol'>Cégünkről</Link></li>
                                <li><Link href='/rolunk/csapatunk'>Csapatunk</Link></li>
                                <li><Link href='/rolunk/karrier'>Karrier</Link></li>
                                <li><Link href='/rolunk/sajto'>Sajtó</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>


                <Link href='/' className={styles.logo_group}>
                    <div className={styles.wrapper}>
                        <Image
                            className={styles.logo}
                            src="/logo.svg"  // Kép útvonala a public mappában
                            alt="logo"    // Kép leírása
                            width={35}        // Kép szélessége pixelben
                            height={35}
                        />
                        <span className={styles.span}>Kóstolj Bele!</span>
                    </div>
                </Link>


            </div>



            <div className={styles.copyright}>
                <p>CopyRight &copy;2024 Thomas Horvath</p>
                <div className={styles.social_icons}>
                    <Link href="https://facebook.com" target="_blank">
                        <FaFacebook size={25} />
                    </Link>
                    <Link href="https://instagram.com" target="_blank">
                        <FaInstagram size={25} />
                    </Link>
                    <Link href="https://twitter.com" target="_blank">
                        <FaTwitter size={25} />
                    </Link>
                    <Link href="https://youtube.com" target="_blank">
                        <FaYoutube size={25} />
                    </Link>
                </div>
            </div>

            <Image
                className={styles.footer_left}
                src="/fruite_bag.svg"
                alt="footer étel"    // Kép leírása
                width={150}        // Kép szélessége pixelben
                height={150}        // Kép magassága pixelben
            />

            <Image
                className={styles.footer_right}
                src="/plate.svg"
                alt="footer étel"    // Kép leírása
                width={150}        // Kép szélessége pixelben
                height={150}        // Kép magassága pixelben
            />

           

        </div>
    )
}

export default Footer
