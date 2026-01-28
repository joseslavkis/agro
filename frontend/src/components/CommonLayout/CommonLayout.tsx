import React from "react";
import { Link } from "wouter";

import { useToken } from "@/services/TokenContext";

import logo from "@/assets/logo.jpg";
import styles from "./CommonLayout.module.css";

export const CommonLayout = ({ children }: React.PropsWithChildren) => {
  const [tokenState] = useToken();

  return (
    <div className={styles.mainLayout}>
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
        <Link href="/login">Log in</Link>
      </li>
      <li>
        <Link href="/signup">Sign Up</Link>
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
        <Link href="/under-construction">Main Page</Link>
      </li>
      <li>
        <button onClick={logOut}>Log out</button>
      </li>
    </>
  );
};
