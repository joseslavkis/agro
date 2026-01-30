import { useState, useEffect } from "react";
import { useField } from "@/services/FieldServices";
import { fetchWeather, getWeatherDescription, WeatherData } from "@/services/WeatherService";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import styles from "./WeatherDashboardScreen.module.css";
import { Link } from "wouter";

interface WeatherDashboardScreenProps {
    id: number;
}

export const WeatherDashboardScreen = ({ id }: WeatherDashboardScreenProps) => {
    const { data: field, isLoading: fieldLoading, error: fieldError } = useField(id);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    useEffect(() => {
        if (field?.latitude && field?.longitude) {
            setWeatherLoading(true);
            fetchWeather(field.latitude, field.longitude)
                .then(setWeather)
                .catch(console.error)
                .finally(() => setWeatherLoading(false));
        }
    }, [field?.latitude, field?.longitude]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).format(date);
    };

    if (fieldLoading) {
        return (
            <CommonLayout>
                <div className={styles.container}>
                    <h2 style={{ color: "white" }}>Cargando información...</h2>
                </div>
            </CommonLayout>
        );
    }

    if (fieldError || !field) {
        return (
            <CommonLayout>
                <div className={styles.container}>
                    <h2 style={{ color: "white" }}>Error al cargar el campo</h2>
                    <Link href="/">
                        <a className={styles.backButton}>Volver</a>
                    </Link>
                </div>
            </CommonLayout>
        );
    }

    return (
        <CommonLayout contentStyle={{ maxWidth: '100%' }}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <Link href={`/fields/${id}`}>
                            <a className={styles.backButton} style={{ marginBottom: '1rem' }}>← Volver al Campo</a>
                        </Link>
                        <h1 className={styles.title}>Clima en {field.name}</h1>
                    </div>
                </header>

                {weatherLoading ? (
                    <div style={{ color: '#94a3b8', fontSize: '1.5rem', textAlign: 'center', marginTop: '4rem' }}>
                        Cargando pronóstico...
                    </div>
                ) : weather ? (
                    <div className={styles.grid}>
                        {/* Current Weather Logic */}
                        <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                            <h3 className={styles.cardTitle}>Ahora</h3>
                            <div className={styles.currentWeather}>
                                <div style={{ fontSize: '6rem' }}>
                                    {getWeatherDescription(weather.current.weather_code).icon}
                                </div>
                                <div>
                                    <div className={styles.temperature}>{weather.current.temperature_2m}°</div>
                                    <div className={styles.weatherLabel}>
                                        {getWeatherDescription(weather.current.weather_code).label}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.statGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{weather.current.relative_humidity_2m}%</div>
                                    <div className={styles.statLabel}>Humedad</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{weather.current.wind_speed_10m} km/h</div>
                                    <div className={styles.statLabel}>Viento</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{weather.current.wind_direction_10m}°</div>
                                    <div className={styles.statLabel}>Dirección</div>
                                </div>
                            </div>
                        </div>

                        {/* Forecast List */}
                        {weather.daily && (
                            <div className={styles.card} style={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
                                <h3 className={styles.cardTitle}>Pronóstico 7 Días</h3>
                                <div className={styles.forecastList}>
                                    {weather.daily.time.map((time, index) => {
                                        // Skip today (index 0) if desired, but 7 day usually includes today
                                        const code = weather.daily!.weather_code[index];
                                        const max = weather.daily!.temperature_2m_max[index];
                                        const min = weather.daily!.temperature_2m_min[index];
                                        const rain = weather.daily!.precipitation_sum[index];

                                        return (
                                            <div key={time} className={styles.forecastItem}>
                                                <div className={styles.forecastDay}>{index === 0 ? 'Hoy' : formatDate(time)}</div>
                                                <div className={styles.forecastIcon}>{getWeatherDescription(code).icon}</div>
                                                <div className={styles.forecastTemps}>
                                                    <span className={styles.maxTemp}>{max}°</span>
                                                    <span className={styles.minTemp}>{min}°</span>
                                                </div>
                                                <div className={styles.forecastRain}>
                                                    {rain !== null && rain > 0 ? `💧 ${rain}mm` : ''}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Additional Metrics or Charts could go here */}
                        <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                            <h3 className={styles.cardTitle}>Detalle de Viento y Lluvias (Próximos días)</h3>
                            {weather.daily && (
                                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                                    {weather.daily.time.map((time, index) => (
                                        <div key={`detail-${time}`} style={{ minWidth: '120px', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{index === 0 ? 'Hoy' : formatDate(time).split(',')[0]}</div>
                                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>💨 Max: {weather.daily?.wind_speed_10m_max[index]} km/h</div>
                                            <div style={{ fontSize: '0.9rem', color: '#60a5fa' }}>💧 {weather.daily?.precipitation_sum[index]} mm</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <h2>No hay datos del clima disponibles</h2>
                        <p>Verifica la ubicación del campo.</p>
                    </div>
                )}
            </div>
        </CommonLayout>
    );
};
