import React from "react";
import { Link } from "wouter";

import { useToken } from "@/services/TokenContext";

import logo from "@/assets/logo.jpg";
import styles from "./CommonLayout.module.css";

export const CommonLayout = ({ children }: React.PropsWithChildren) => {
  const [tokenState] = useToken();

  return (
    <div className={styles.mainLayout}>
      <video autoPlay loop muted playsInline className={styles.backgroundVideo}>
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className={styles.overlay} />
      <nav className={styles.topBar}>
        <img src={logo} alt="Agro Logo" className={styles.logo} />
        <ul className={styles.navLinks}>{tokenState.state === "LOGGED_OUT" ? <LoggedOutLinks /> : <LoggedInLinks />}</ul>
      </nav>
      <div className={styles.body}>{children}</div>
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

const LoggedInLinks = () => {
  const [, setTokenState] = useToken();

  const logOut = () => {
    setTokenState({ state: "LOGGED_OUT" });
  };

  return (
    <>
      <li>
        <Link href="/under-construction">Página Principal</Link>
      </li>
      <li>
        <button onClick={logOut}>Cerrar Sesión</button>
      </li>
    </>
  );
};
