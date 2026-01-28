
import styles from "./FieldCard.module.css";
import { Field } from "@/models/Field";
import { getFieldPhotoUrl } from "@/utils/field-photos";
import React, { useMemo } from "react";

interface FieldCardProps {
    field: Field;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field }) => {
    // Use useMemo to prevent photo changing on every render if we are using random
    // However, random on *every* render is bad.
    // Ideally, the Backend should have assigned a specific default photo string if the user didn't provide one.
    // Or we just use a hash of the ID to pick one deterministically if it's null.

    const photoUrl = useMemo(() => {
        if (field.photo) return field.photo;
        // Deterministic fallback based on ID so it doesn't flicker random
        const photos = [
            "/assets/fields_photos/pexels-despierres-cecile-93261-299031.jpg",
            "/assets/fields_photos/pexels-kaip-585039.jpg",
            "/assets/fields_photos/pexels-kelly-7446503.jpg",
            "/assets/fields_photos/pexels-m-p-155330626-26236705.jpg",
            "/assets/fields_photos/pexels-mikebirdy-448733.jpg",
            "/assets/fields_photos/pexels-seb-116613-360013.jpg"
        ];
        return photos[field.id % photos.length];
    }, [field.id, field.photo]);

    return (
        <div className={styles.card}>
            <div className={styles.info}>
                <h3 className={styles.name}>{field.name}</h3>
                <span className={styles.hectares}>{field.hectares} Ha</span>
            </div>
            <div className={styles.imageContainer}>
                <img src={photoUrl} alt={field.name} className={styles.image} />
            </div>
        </div>
    );
};
