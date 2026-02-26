import { useState, useEffect, useCallback } from "react";
import { useField } from "@/services/FieldServices";
import {
    fetchWeather,
    fetchRainHistory,
    getWeatherDescription,
    getWeatherEmoji,
    WeatherData,
    RainHistoryData,
} from "@/services/WeatherService";
import styles from "./WeatherDashboardScreen.module.css";
import { Link } from "wouter";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
    Line,
} from "recharts";

interface WeatherDashboardScreenProps {
    id: number;
}

/* ───────── SVG Icon Components ───────── */
const IconDroplet = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.inlineIcon}>
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
);
const IconWind = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.inlineIcon}>
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
);
const IconCompass = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.inlineIcon}>
        <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
);
const IconThermometer = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.inlineIcon}>
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
);
const IconArrowLeft = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);
const IconRefresh = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);
const IconCloudRain = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <line x1="16" y1="13" x2="16" y2="21" /><line x1="8" y1="13" x2="8" y2="21" /><line x1="12" y1="15" x2="12" y2="23" />
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
    </svg>
);

export const WeatherDashboardScreen = ({ id }: WeatherDashboardScreenProps) => {
    const { data: field, isLoading: fieldLoading, error: fieldError } = useField(id);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [rainHistory, setRainHistory] = useState<RainHistoryData | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [rainLoading, setRainLoading] = useState(false);

    useEffect(() => {
        if (field?.latitude && field?.longitude) {
            setWeatherLoading(true);
            fetchWeather(field.latitude, field.longitude)
                .then(setWeather)
                .catch(console.error)
                .finally(() => setWeatherLoading(false));
        }
    }, [field?.latitude, field?.longitude]);

    const loadRainHistory = useCallback(() => {
        if (field?.latitude && field?.longitude) {
            setRainLoading(true);
            fetchRainHistory(field.latitude, field.longitude, 30)
                .then(setRainHistory)
                .catch(console.error)
                .finally(() => setRainLoading(false));
        }
    }, [field?.latitude, field?.longitude]);

    // Auto-load rain history when field is available
    useEffect(() => {
        if (field?.latitude && field?.longitude) {
            loadRainHistory();
        }
    }, [field?.latitude, field?.longitude, loadRainHistory]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString + "T12:00:00");
        return new Intl.DateTimeFormat("es-ES", {
            weekday: "short",
            day: "numeric",
            month: "short",
        }).format(date);
    };

    const formatShortDate = (dateString: string) => {
        const date = new Date(dateString + "T12:00:00");
        return new Intl.DateTimeFormat("es-ES", {
            day: "numeric",
            month: "short",
        }).format(date);
    };

    /* ── Build chart data from hourly forecast ── */
    const hourlyChartData = weather?.hourly
        ? weather.hourly.time.slice(0, 48).map((t, i) => {
              const d = new Date(t);
              return {
                  time: `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, "0")}h`,
                  temp: weather.hourly!.temperature_2m[i] ?? 0,
                  lluvia: weather.hourly!.precipitation[i] ?? 0,
                  humedad: weather.hourly!.relative_humidity_2m[i] ?? 0,
                  viento: weather.hourly!.wind_speed_10m[i] ?? 0,
              };
          })
        : [];

    /* ── Build rain history chart data ── */
    const rainChartData = rainHistory
        ? rainHistory.daily.time.map((t, i) => ({
              date: formatShortDate(t),
              lluvia: rainHistory.daily.precipitation_sum[i] ?? 0,
          }))
        : [];

    /* ── Loading ── */
    if (fieldLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingWrapper}>
                    <div className={styles.spinner} />
                    <p className={styles.loadingText}>Cargando informacion...</p>
                </div>
            </div>
        );
    }

    if (fieldError || !field) {
        return (
            <div className={styles.page}>
                <div className={styles.errorWrapper}>
                    <h2 className={styles.errorTitle}>Error al cargar el campo</h2>
                    <Link href="/">
                        <a className={styles.backBtn}>Volver</a>
                    </Link>
                </div>
            </div>
        );
    }

    const totalDailyRain =
        weather?.daily?.precipitation_sum?.reduce((s, v) => s + (v ?? 0), 0) ?? 0;

    return (
        <div className={styles.page}>
            {/* ─── Nav ─── */}
            <nav className={styles.topNav}>
                <Link href={`/fields/${id}`}>
                    <a className={styles.backBtn}>
                        <IconArrowLeft /> Volver al campo
                    </a>
                </Link>
                <h1 className={styles.navTitle}>Clima &mdash; {field.name}</h1>
                <div className={styles.navSpacer} />
            </nav>

            <div className={styles.dashboard}>
                {weatherLoading ? (
                    <div className={styles.loadingWrapper}>
                        <div className={styles.spinner} />
                        <p className={styles.loadingText}>Cargando pronostico...</p>
                    </div>
                ) : weather ? (
                    <>
                        {/* ─── Top Row: Current + Stats ─── */}
                        <section className={styles.topRow}>
                            {/* Current weather hero */}
                            <div className={styles.heroCard}>
                                <span className={styles.heroEmoji}>
                                    {getWeatherEmoji(weather.current.weather_code)}
                                </span>
                                <div className={styles.heroInfo}>
                                    <span className={styles.heroTemp}>
                                        {weather.current.temperature_2m}
                                        <span className={styles.heroDeg}>{"\u00B0C"}</span>
                                    </span>
                                    <span className={styles.heroLabel}>
                                        {getWeatherDescription(weather.current.weather_code).label}
                                    </span>
                                </div>
                            </div>

                            {/* Stat cards */}
                            <div className={styles.statCard}>
                                <IconDroplet />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>
                                        {weather.current.relative_humidity_2m}%
                                    </span>
                                    <span className={styles.statLabel}>Humedad</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <IconWind />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>
                                        {weather.current.wind_speed_10m} km/h
                                    </span>
                                    <span className={styles.statLabel}>Viento</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <IconCompass />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>
                                        {weather.current.wind_direction_10m}{"\u00B0"}
                                    </span>
                                    <span className={styles.statLabel}>Direccion</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <IconThermometer />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>
                                        {totalDailyRain.toFixed(1)} mm
                                    </span>
                                    <span className={styles.statLabel}>Lluvia 7d</span>
                                </div>
                            </div>
                        </section>

                        {/* ─── Middle Row: Forecast + Wind/Rain detail ─── */}
                        <section className={styles.midRow}>
                            {/* 7-day forecast */}
                            {weather.daily && (
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>Pronostico 7 Dias</h3>
                                    <div className={styles.forecastList}>
                                        {weather.daily.time.map((time, index) => {
                                            const code = weather.daily!.weather_code[index];
                                            const max = weather.daily!.temperature_2m_max[index];
                                            const min = weather.daily!.temperature_2m_min[index];
                                            const rain = weather.daily!.precipitation_sum[index];

                                            return (
                                                <div
                                                    key={time}
                                                    className={styles.forecastItem}
                                                >
                                                    <span className={styles.forecastDay}>
                                                        {index === 0 ? "Hoy" : formatDate(time)}
                                                    </span>
                                                    <span className={styles.forecastEmoji}>
                                                        {getWeatherEmoji(code)}
                                                    </span>
                                                    <span className={styles.forecastTemps}>
                                                        <span className={styles.maxTemp}>{max}{"\u00B0"}</span>
                                                        <span className={styles.minTemp}>{min}{"\u00B0"}</span>
                                                    </span>
                                                    <span className={styles.forecastRain}>
                                                        {rain !== null && rain > 0 ? (
                                                            <>
                                                                <IconDroplet />
                                                                {rain} mm
                                                            </>
                                                        ) : null}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Wind / Rain detail per day */}
                            {weather.daily && (
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>
                                        Detalle Viento y Lluvias
                                    </h3>
                                    <div className={styles.detailScroll}>
                                        {weather.daily.time.map((time, index) => (
                                            <div
                                                key={`detail-${time}`}
                                                className={styles.detailChip}
                                            >
                                                <span className={styles.detailDay}>
                                                    {index === 0 ? "Hoy" : formatDate(time).split(",")[0]}
                                                </span>
                                                <span className={styles.detailRow}>
                                                    <IconWind />
                                                    {weather.daily?.wind_speed_10m_max[index]} km/h
                                                </span>
                                                <span className={`${styles.detailRow} ${styles.detailRain}`}>
                                                    <IconDroplet />
                                                    {weather.daily?.precipitation_sum[index]} mm
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ─── Chart: Hourly Forecast (48h) ─── */}
                        {hourlyChartData.length > 0 && (
                            <section className={styles.chartSection}>
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>
                                        Pronostico por hora (48h)
                                    </h3>
                                    <div className={styles.chartWrapper}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <ComposedChart data={hourlyChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                <XAxis
                                                    dataKey="time"
                                                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                                                    interval="preserveStartEnd"
                                                    tickLine={false}
                                                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                                                />
                                                <YAxis
                                                    yAxisId="temp"
                                                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    unit={"\u00B0"}
                                                />
                                                <YAxis
                                                    yAxisId="rain"
                                                    orientation="right"
                                                    tick={{ fill: "#60a5fa", fontSize: 11 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    unit="mm"
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "rgba(15,23,42,0.95)",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                        borderRadius: "12px",
                                                        color: "#e2e8f0",
                                                    }}
                                                />
                                                <Legend
                                                    wrapperStyle={{ color: "#94a3b8", fontSize: 12 }}
                                                />
                                                <Area
                                                    yAxisId="temp"
                                                    type="monotone"
                                                    dataKey="temp"
                                                    name="Temp"
                                                    stroke="#f59e0b"
                                                    fill="rgba(245,158,11,0.15)"
                                                    strokeWidth={2}
                                                />
                                                <Bar
                                                    yAxisId="rain"
                                                    dataKey="lluvia"
                                                    name="Lluvia"
                                                    fill="rgba(96,165,250,0.6)"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ─── Chart: Historical Rain (30d) ─── */}
                        <section className={styles.chartSection}>
                            <div className={styles.card}>
                                <div className={styles.chartHeader}>
                                    <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>
                                        <IconCloudRain /> Historial de lluvias (30 dias)
                                    </h3>
                                    <button
                                        className={styles.rainBtn}
                                        onClick={loadRainHistory}
                                        disabled={rainLoading}
                                    >
                                        <IconRefresh />
                                        {rainLoading ? "Cargando..." : "Cargar lluvia"}
                                    </button>
                                </div>

                                {rainLoading && !rainHistory ? (
                                    <div className={styles.chartPlaceholder}>
                                        <div className={styles.spinner} />
                                        <p>Cargando datos historicos...</p>
                                    </div>
                                ) : rainChartData.length > 0 ? (
                                    <div className={styles.chartWrapper}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={rainChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                                                    interval="preserveStartEnd"
                                                    tickLine={false}
                                                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                                                />
                                                <YAxis
                                                    tick={{ fill: "#60a5fa", fontSize: 11 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    unit=" mm"
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "rgba(15,23,42,0.95)",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                        borderRadius: "12px",
                                                        color: "#e2e8f0",
                                                    }}
                                                    formatter={(value: number) => [`${value} mm`, "Lluvia"]}
                                                />
                                                <Bar
                                                    dataKey="lluvia"
                                                    name="Lluvia"
                                                    fill="rgba(96,165,250,0.7)"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className={styles.chartPlaceholder}>
                                        <p>No hay datos de lluvia disponibles.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <h2>No hay datos del clima disponibles</h2>
                        <p>Verifica la ubicacion del campo.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
