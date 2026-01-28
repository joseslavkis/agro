export const FIELD_PHOTOS = [
    { id: "default_1", src: "/fields_photos/pexels-despierres-cecile-93261-299031.jpg" },
    { id: "default_2", src: "/fields_photos/pexels-kaip-585039.jpg" },
    { id: "default_3", src: "/fields_photos/pexels-kelly-7446503.jpg" },
    { id: "default_4", src: "/fields_photos/pexels-m-p-155330626-26236705.jpg" },
    { id: "default_5", src: "/fields_photos/pexels-mikebirdy-448733.jpg" },
    { id: "default_6", src: "/fields_photos/pexels-seb-116613-360013.jpg" },
];

export const getRandomFieldPhoto = () => {
    const randomIndex = Math.floor(Math.random() * FIELD_PHOTOS.length);
    return FIELD_PHOTOS[randomIndex].src;
};

import { BASE_API_URL } from "@/config/app-query-client";

// Map backend "photo" string (which might be null/empty or a specific ID) to a real URL
export const getFieldPhotoUrl = (photoIdentifier?: string | null) => {
    if (!photoIdentifier) return getRandomFieldPhoto();

    // If it starts with http, assume full URL (user custom)
    if (photoIdentifier.startsWith("http")) return photoIdentifier;

    // If it is an uploaded file from backend
    if (photoIdentifier.startsWith("/uploads")) {
        // Handle case where BASE_API_URL might have trailing slash
        const baseUrl = BASE_API_URL.endsWith('/') ? BASE_API_URL.slice(0, -1) : BASE_API_URL;
        return `${baseUrl}${photoIdentifier}`;
    }

    return photoIdentifier;
};
