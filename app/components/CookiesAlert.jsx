"use client"

import { useEffect, useState } from 'react';
import styles from '../styles/cookies.module.scss';

const CookiesAlert = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Ellenőrizzük, hogy a cookie-kat elfogadták-e vagy tagadták
        const hasAcceptedCookies = sessionStorage.getItem('cookiesAccepted');
        const hasDeniedCookies = sessionStorage.getItem('cookiesDenied');

        if (!hasAcceptedCookies || hasDeniedCookies) {

            const timer = setTimeout(() => {
                setShow(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else if (hasAcceptedCookies) {
            setShow(false);
        } else {
            const timer = setTimeout(() => {
                setShow(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptCookies = () => {
        sessionStorage.setItem('cookiesAccepted', 'true');
        sessionStorage.removeItem('cookiesDenied');
        setShow(false);
    };

    const handleDenyCookies = () => {
        sessionStorage.setItem('cookiesDenied', 'true');
        sessionStorage.removeItem('cookiesAccepted');
        setShow(false);
    };

    return (
        show && (
            <div className={styles.cookies_container}>
                <button className={`${styles.cookies_btn} btn-green`} onClick={handleAcceptCookies}>Jöhetnek a sütik</button>
                <button className={`${styles.cookies_btn_white} btn-green-border`} onClick={handleDenyCookies}>Elutasítom</button>
            </div>
        )
    )
}

export default CookiesAlert