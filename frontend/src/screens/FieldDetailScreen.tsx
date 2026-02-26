import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useField, useUpdateField } from "@/services/FieldServices";
import { fetchWeather, getWeatherDescription, getWeatherEmoji, WeatherData } from "@/services/WeatherService";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import styles from "./FieldDetailScreen.module.css";
import { Link } from "wouter";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for Leaflet default icon not showing
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: { position: { lat: number, lng: number } | null, setPosition: (pos: { lat: number, lng: number }) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}

interface FieldDetailScreenProps {
    id: number;
}

export const FieldDetailScreen = ({ id }: FieldDetailScreenProps) => {
    const { data: field, isLoading, error } = useField(id);
    const { mutateAsync: updateField, isPending: isUpdating } = useUpdateField();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [editFormData, setEditFormData] = useState<{
        name: string;
        hectares: string;
        hasAgriculture: boolean;
        hasLivestock: boolean;
        latitude: number | null;
        longitude: number | null;
        cows: number;
        bulls: number;
        steers: number;
        youngSteers: number;
        heifers: number;
        maleCalves: number;
        femaleCalves: number;
    }>({
        name: "",
        hectares: "",
        hasAgriculture: false,
        hasLivestock: false,
        latitude: null,
        longitude: null,
        cows: 0,
        bulls: 0,
        steers: 0,
        youngSteers: 0,
        heifers: 0,
        maleCalves: 0,
        femaleCalves: 0,
    });

    useEffect(() => {
        if (field?.latitude && field?.longitude) {
            setWeatherLoading(true);
            fetchWeather(field.latitude, field.longitude)
                .then(setWeather)
                .catch(console.error)
                .finally(() => setWeatherLoading(false));
        }
    }, [field?.latitude, field?.longitude]);

    const handleEditClick = () => {
        if (field) {
            setEditFormData({
                name: field.name,
                hectares: field.hectares.toString(),
                hasAgriculture: field.hasAgriculture ?? false,
                hasLivestock: field.hasLivestock ?? false,
                latitude: field.latitude ?? null,
                longitude: field.longitude ?? null,
                cows: field.cows ?? 0,
                bulls: field.bulls ?? 0,
                steers: field.steers ?? 0,
                youngSteers: field.youngSteers ?? 0,
                heifers: field.heifers ?? 0,
                maleCalves: field.maleCalves ?? 0,
                femaleCalves: field.femaleCalves ?? 0,
            });
            setFormError(null);
            setIsEditModalOpen(true);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateField({
                id,
                data: {
                    name: editFormData.name,
                    hectares: parseFloat(editFormData.hectares),
                    hasAgriculture: editFormData.hasAgriculture,
                    hasLivestock: editFormData.hasLivestock,
                    latitude: editFormData.latitude ?? undefined,
                    longitude: editFormData.longitude ?? undefined,
                    cows: editFormData.cows,
                    bulls: editFormData.bulls,
                    steers: editFormData.steers,
                    youngSteers: editFormData.youngSteers,
                    heifers: editFormData.heifers,
                    maleCalves: editFormData.maleCalves,
                    femaleCalves: editFormData.femaleCalves,
                }
            });
            setIsEditModalOpen(false);
        } catch (error: any) {
            console.error("Error updating field:", error);
            let errorMessage = "Error al actualizar el campo";

            // Try to parse validation error
            if (error.message && error.message.includes("400")) {
                try {
                    const jsonStart = error.message.indexOf('{');
                    if (jsonStart !== -1) {
                        const jsonStr = error.message.substring(jsonStart);
                        const data = JSON.parse(jsonStr);
                        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                            errorMessage = data.errors[0].defaultMessage || errorMessage;
                        } else if (data.message) {
                            errorMessage = data.message;
                        }
                    }
                } catch (e) {
                    console.error("Parsing error failed", e);
                }
            }

            setFormError(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <CommonLayout>
                <div className={styles.container}>
                    <h2 style={{ color: "white" }}>Cargando información del campo...</h2>
                </div>
            </CommonLayout>
        );
    }

    if (error || !field) {
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
                        <Link href="/">
                            <a className={styles.backButton} style={{ display: 'inline-flex', marginBottom: '1rem' }}>← Volver</a>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 className={styles.title}>{field.name}</h1>
                            <button className={styles.editButton} onClick={handleEditClick}>
                                Editar
                            </button>
                        </div>
                    </div>
                </header>

                <div className={styles.dashboardGrid}>
                    {/* General Info */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Información General</h3>
                        <div className={styles.infoRow}>
                            <span>{field.hectares} Hectáreas</span>
                        </div>
                        {field.hasAgriculture && (
                            <div className={styles.infoRow}>
                                <span>Agricultura</span>
                            </div>
                        )}
                        {field.hasLivestock && (
                            <div className={styles.infoRow}>
                                <span>Ganadería</span>
                            </div>
                        )}
                    </div>

                    {/* Livestock Card */}
                    {field.hasLivestock && (
                        <Link href={`/fields/${id}/livestock`}>
                            <a className={styles.card} style={{ textDecoration: 'none', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 className={styles.cardTitle} style={{ marginBottom: 0, borderBottom: 'none' }}>Ganadería ({((field.cows || 0) + (field.bulls || 0) + (field.steers || 0) + (field.youngSteers || 0) + (field.heifers || 0) + (field.maleCalves || 0) + (field.femaleCalves || 0))})</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#60a5fa' }}>Ver Detalle →</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.8rem', marginTop: '1rem' }}>
                                    {[
                                        { label: 'Vacas', value: field.cows },
                                        { label: 'Toros', value: field.bulls },
                                        { label: 'Novillos', value: field.steers },
                                        { label: 'Novillitos', value: field.youngSteers },
                                        { label: 'Vaquillonas', value: field.heifers },
                                        { label: 'Terneros', value: field.maleCalves },
                                        { label: 'Terneras', value: field.femaleCalves },
                                    ].map((item, index) => (
                                        <div key={index} style={{
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '0.5rem',
                                            padding: '0.8rem',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.2rem' }}>{item.label}</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>{item.value || 0}</div>
                                        </div>
                                    ))}
                                </div>
                            </a>
                        </Link>
                    )}

                    {/* Weather Card */}
                    <Link href={`/fields/${id}/weather`}>
                        <a className={`${styles.card} ${styles.weatherCard}`} style={{ textDecoration: 'none', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className={styles.cardTitle} style={{ marginBottom: 0, borderBottom: 'none' }}>Clima Actual</h3>
                                <span style={{ fontSize: '0.9rem', color: '#60a5fa' }}>Ver Pronóstico →</span>
                            </div>

                            {weatherLoading ? (
                                <p style={{ color: '#94a3b8' }}>Cargando clima...</p>
                            ) : weather ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '3rem' }}>
                                            {getWeatherEmoji(weather.current.weather_code)}
                                        </span>
                                        <div>
                                            <div className={styles.statValue}>
                                                {weather.current.temperature_2m}°C
                                            </div>
                                            <div style={{ color: '#94a3b8' }}>
                                                {getWeatherDescription(weather.current.weather_code).label}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <div className={styles.infoRow} style={{ fontSize: '0.9rem', background: 'transparent', padding: 0 }}>
                                            💧 Humedad: {weather.current.relative_humidity_2m}%
                                        </div>
                                        <div className={styles.infoRow} style={{ fontSize: '0.9rem', background: 'transparent', padding: 0 }}>
                                            💨 Viento: {weather.current.wind_speed_10m} km/h
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: '#94a3b8' }}>
                                    {field.latitude && field.longitude ? "No se pudo cargar el clima." : "Ubicación no configurada."}
                                </p>
                            )}
                        </a>
                    </Link>

                    {/* Location / Map */}
                    {field.latitude && field.longitude && (
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Ubicación</h3>
                            {/* Added wrapper div for responsive map aspect ratio if needed, but gridColumn 1/-1 makes it full width */}
                            <div className={styles.mapContainer}>
                                <MapContainer center={[field.latitude, field.longitude]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        attribution='Map data &copy; Google'
                                        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                    />
                                    <Marker position={[field.latitude, field.longitude]}>
                                        <Popup>
                                            {field.name}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                {isEditModalOpen && createPortal(
                    <div className={styles.modalOverlay} onClick={(e) => {
                        if (e.target === e.currentTarget) setIsEditModalOpen(false);
                    }}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.h2}>Editar Campo</h2>
                            <form onSubmit={handleEditSubmit}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Nombre del Campo</label>
                                    <input
                                        className={styles.input}
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        placeholder="Ej. La Estancia"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Hectáreas</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        step="0.1"
                                        value={editFormData.hectares}
                                        onChange={(e) => setEditFormData({ ...editFormData, hectares: e.target.value })}
                                        placeholder="Ej. 150.5"
                                    />
                                </div>

                                <div className={styles.inputGroup} style={{ flexDirection: 'row', gap: '2rem', display: 'flex' }}>
                                    <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={editFormData.hasAgriculture}
                                            onChange={(e) => setEditFormData({ ...editFormData, hasAgriculture: e.target.checked })}
                                            style={{ width: '1.2rem', height: '1.2rem', accentColor: '#10b981' }}
                                        />
                                        Agricultura
                                    </label>
                                    <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={editFormData.hasLivestock}
                                            onChange={(e) => setEditFormData({ ...editFormData, hasLivestock: e.target.checked })}
                                            style={{ width: '1.2rem', height: '1.2rem', accentColor: '#10b981' }}
                                        />
                                        Ganadería
                                    </label>
                                </div>

                                {editFormData.hasLivestock && (
                                    <div style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        margin: '1rem 0'
                                    }}>
                                        <p style={{ color: '#93c5fd', margin: 0, fontSize: '0.9rem' }}>
                                            ℹ️ Para modificar el stock (Nacimientos, Mortandad, Movimientos), por favor utilice la sección de
                                            <Link href="/livestock"><strong> Ganadería General</strong></Link>.
                                        </p>
                                    </div>
                                )}

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Ubicación (Marque en el mapa)</label>
                                    <div style={{ height: '300px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                        <MapContainer center={editFormData.latitude ? [editFormData.latitude, editFormData.longitude!] : [-34.6, -58.4]} zoom={editFormData.latitude ? 13 : 5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer
                                                attribution='Map data &copy; Google'
                                                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                            />
                                            <LocationMarker
                                                position={editFormData.latitude !== null && editFormData.longitude !== null ? { lat: editFormData.latitude, lng: editFormData.longitude! } : null}
                                                setPosition={(pos) => setEditFormData({ ...editFormData, latitude: pos.lat, longitude: pos.lng })}
                                            />
                                        </MapContainer>
                                    </div>
                                </div>

                                {formError && (
                                    <div style={{ color: "#ff6b6b", marginBottom: "1rem", backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                        {formError}
                                    </div>
                                )}

                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? "Guardando..." : "Guardar Cambios"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </CommonLayout>
    );
};
