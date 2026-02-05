import React from "react";
import { Link } from "wouter";

import { useToken } from "@/services/TokenContext";

import logo from "@/assets/logo_no_words.jpg";
import styles from "./CommonLayout.module.css";

export const CommonLayout = ({ children, showVideo = true, contentClassName, contentStyle }: React.PropsWithChildren<{ showVideo?: boolean, contentClassName?: string, contentStyle?: React.CSSProperties }>) => {
  const [tokenState] = useToken();

  return (
    <div className={styles.mainLayout}>
      {showVideo && (
        <video autoPlay loop muted playsInline className={styles.backgroundVideo}>
          <source src="/background.mp4" type="video/mp4" />
        </video>
      )}
      <div className={styles.overlay} />
      <nav className={styles.topBar}>
        <img src={logo} alt="Agro Logo" className={styles.logo} />
        <ul className={styles.navLinks}>{tokenState.state === "LOGGED_OUT" ? <LoggedOutLinks /> : <LoggedInLinks />}</ul>
      </nav>
      <div className={`${styles.body} ${contentClassName || ''}`} style={contentStyle}>{children}</div>
    </div>
  );
};

const LoggedOutLinks = () => {
  return (
    <>
      <li>
        <Link href="/login">Iniciar Sesión</Link>
      </li>
      <li>
        <Link href="/signup">Registrarse</Link>
      </li>
    </>
  );
};

import { useMyFields } from "@/services/FieldServices";

const LoggedInLinks = () => {
  const [, setTokenState] = useToken();
  const { data: fields } = useMyFields();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLLIElement>(null);

  const hasLivestock = fields?.some(field => field.hasLivestock);

  const logOut = () => {
    setTokenState({ state: "LOGGED_OUT" });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <li className={styles.burgerWrapper} ref={menuRef}>
      <button
        className={styles.burgerButton}
        onClick={toggleMenu}
        aria-label="Menu"
        aria-expanded={isMenuOpen}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {isMenuOpen && (
        <div className={styles.dropdownMenu}>
          <Link href="/" onClick={() => setIsMenuOpen(false)} className={styles.dropdownItem}>
            Mis Campos
          </Link>
          {hasLivestock && (
            <Link href="/livestock" onClick={() => setIsMenuOpen(false)} className={styles.dropdownItem}>
              Ganadería
            </Link>
          )}
          <Link href="/partners" onClick={() => setIsMenuOpen(false)} className={styles.dropdownItem}>
            Socios
          </Link>
          <button onClick={logOut} className={`${styles.dropdownItem} ${styles.logoutButton}`}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </li>
  );
};
