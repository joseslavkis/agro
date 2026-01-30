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

  const hasLivestock = fields?.some(field => field.hasLivestock);

  const logOut = () => {
    setTokenState({ state: "LOGGED_OUT" });
  };

  return (
    <>
      <li>
        <Link href="/">Mis Campos</Link>
      </li>
      {hasLivestock && (
        <li>
          <Link href="/livestock">Ganadería</Link>
        </li>
      )}
      <li>
        <Link href="/partners">Socios</Link>
      </li>
      <li>
        <button onClick={logOut}>Cerrar Sesión</button>
      </li>
    </>
  );
};
