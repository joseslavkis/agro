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
});

export type WeatherData = z.infer<typeof WeatherSchema>;

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();
    return WeatherSchema.parse(data);
}

// Helper to interpret WMO Weather codes from Open-Meteo
export function getWeatherDescription(code: number | null): { label: string; icon: string } {
    if (code === null) return { label: "Desconocido", icon: "❓" };

    // Simple mapping based on WMO codes
    // 0: Clear sky
    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    // 45, 48: Fog
    // 51-57: Drizzle
    // 61-67: Rain
    // 71-77: Snow
    // 80-82: Rain showers
    // 95-99: Thunderstorm

    switch (true) {
        case code === 0:
            return { label: "Despejado", icon: "☀️" };
        case code >= 1 && code <= 3:
            return { label: "Parcialmente Nublado", icon: "⛅" };
        case code === 45 || code === 48:
            return { label: "Niebla", icon: "🌫️" };
        case code >= 51 && code <= 67:
            return { label: "Lluvia", icon: "🌧️" };
        case code >= 71 && code <= 77:
            return { label: "Nieve", icon: "❄️" };
        case code >= 80 && code <= 82:
            return { label: "Lluvia Fuerte", icon: "🌦️" };
        case code >= 95 && code <= 99:
            return { label: "Tormenta", icon: "⛈️" };
        default:
            return { label: "Desconocido", icon: "❓" };
    }
}
