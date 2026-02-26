import { z } from "zod";

export const WeatherSchema = z.object({
    current: z.object({
        temperature_2m: z.number().nullable(),
        relative_humidity_2m: z.number().nullable(),
        weather_code: z.number().nullable(),
        wind_speed_10m: z.number().nullable(),
        wind_direction_10m: z.number().nullable(),
    }),
    daily: z.object({
        time: z.array(z.string()),
        weather_code: z.array(z.number().nullable()),
        temperature_2m_max: z.array(z.number().nullable()),
        temperature_2m_min: z.array(z.number().nullable()),
        precipitation_sum: z.array(z.number().nullable()),
        wind_speed_10m_max: z.array(z.number().nullable()),
    }).optional(),
    hourly: z.object({
        time: z.array(z.string()),
        temperature_2m: z.array(z.number().nullable()),
        precipitation: z.array(z.number().nullable()),
        relative_humidity_2m: z.array(z.number().nullable()),
        wind_speed_10m: z.array(z.number().nullable()),
    }).optional(),
});

export type WeatherData = z.infer<typeof WeatherSchema>;

export const RainHistorySchema = z.object({
    daily: z.object({
        time: z.array(z.string()),
        precipitation_sum: z.array(z.number().nullable()),
    }),
});

export type RainHistoryData = z.infer<typeof RainHistorySchema>;

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&hourly=temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m&timezone=auto`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();
    return WeatherSchema.parse(data);
}

export async function fetchRainHistory(lat: number, lng: number, days: number = 30): Promise<RainHistoryData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const response = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${fmt(startDate)}&end_date=${fmt(endDate)}&daily=precipitation_sum&timezone=auto`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch rain history");
    }

    const data = await response.json();
    return RainHistorySchema.parse(data);
}

// Helper to interpret WMO Weather codes from Open-Meteo
export function getWeatherDescription(code: number | null): { label: string; icon: string } {
    if (code === null) return { label: "Desconocido", icon: "?" };

    switch (true) {
        case code === 0:
            return { label: "Despejado", icon: "sun" };
        case code >= 1 && code <= 3:
            return { label: "Parcialmente Nublado", icon: "cloud-sun" };
        case code === 45 || code === 48:
            return { label: "Niebla", icon: "fog" };
        case code >= 51 && code <= 67:
            return { label: "Lluvia", icon: "rain" };
        case code >= 71 && code <= 77:
            return { label: "Nieve", icon: "snow" };
        case code >= 80 && code <= 82:
            return { label: "Lluvia Fuerte", icon: "heavy-rain" };
        case code >= 95 && code <= 99:
            return { label: "Tormenta", icon: "storm" };
        default:
            return { label: "Desconocido", icon: "unknown" };
    }
}

export function getWeatherEmoji(code: number | null): string {
    if (code === null) return "?";
    switch (true) {
        case code === 0: return "\u2600\uFE0F";
        case code >= 1 && code <= 3: return "\u26C5";
        case code === 45 || code === 48: return "\uD83C\uDF2B\uFE0F";
        case code >= 51 && code <= 67: return "\uD83C\uDF27\uFE0F";
        case code >= 71 && code <= 77: return "\u2744\uFE0F";
        case code >= 80 && code <= 82: return "\uD83C\uDF26\uFE0F";
        case code >= 95 && code <= 99: return "\u26C8\uFE0F";
        default: return "\u2753";
    }
}
