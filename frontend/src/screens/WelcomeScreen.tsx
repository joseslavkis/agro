import { Link } from "wouter";
import logo from "@/assets/logo.jpg";
import styles from "./WelcomeScreen.module.css";

export const WelcomeScreen = () => {
    return (
        <div className={styles.container}>
            <video autoPlay loop muted playsInline className={styles.backgroundVideo}>
                <source src="/background.mp4" type="video/mp4" />
            </video>
            <div className={styles.overlay} />
            <img src={logo} alt="Logo" className={styles.logo} />
            <div className={styles.content}>
                <h1 className={styles.title}>Welcome to Agro</h1>
                <Link href="/login" className={styles.buttonLink}>
                    <button className={`${styles.button} ${styles.primaryBtn}`}>Log In</button>
                </Link>
                <Link href="/signup" className={styles.buttonLink}>
                    <button className={`${styles.button} ${styles.secondaryBtn}`}>Sign Up</button>
                </Link>
            </div>
        </div>
    );
};
