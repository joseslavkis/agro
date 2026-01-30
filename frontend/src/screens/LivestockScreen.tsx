import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useMyFields } from "@/services/FieldServices";
import styles from "./FieldDetailScreen.module.css";

export const LivestockScreen = () => {
    const { data: fields, isLoading } = useMyFields();
    const [selectedCategory, setSelectedCategory] = useState<{ key: string, label: string } | null>(null);

    // Filter livestock fields and sum up animals
    const livestockFields = fields?.filter(f => f.hasLivestock) || [];

    const totalCows = livestockFields.reduce((acc, curr) => acc + (curr.cows || 0), 0);
    const totalBulls = livestockFields.reduce((acc, curr) => acc + (curr.bulls || 0), 0);
    const totalSteers = livestockFields.reduce((acc, curr) => acc + (curr.steers || 0), 0);
    const totalYoungSteers = livestockFields.reduce((acc, curr) => acc + (curr.youngSteers || 0), 0);
    const totalHeifers = livestockFields.reduce((acc, curr) => acc + (curr.heifers || 0), 0);
    const totalMaleCalves = livestockFields.reduce((acc, curr) => acc + (curr.maleCalves || 0), 0);
    const totalFemaleCalves = livestockFields.reduce((acc, curr) => acc + (curr.femaleCalves || 0), 0);

    const totalAnimals = totalCows + totalBulls + totalSteers + totalYoungSteers + totalHeifers + totalMaleCalves + totalFemaleCalves;

    if (isLoading) {
        return (
            <CommonLayout>
                <div className={styles.container}>
                    <h2 style={{ color: "white" }}>Cargando información ganadera...</h2>
                </div>
            </CommonLayout>
        );
    }

    if (livestockFields.length === 0) {
        return (
            <CommonLayout>
                <div className={styles.container}>
                    <h2 style={{ color: "white" }}>No tienes campos ganaderos registrados</h2>
                    <Link href="/">
                        <a className={styles.backButton}>Ir a Mis Campos</a>
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
                        <h1 className={styles.title}>Ganadería General</h1>
                        <p style={{ color: '#93c5fd', marginTop: '0.5rem' }}>Resumen de Hacienda Totales</p>
                    </div>
                </header>

                <div className={styles.dashboardGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <div className={styles.card} onClick={() => setSelectedCategory({ key: 'total', label: 'Total Cabezas' })} style={{ cursor: 'pointer', border: '2px solid #3b82f6' }}>
                        <h3 className={styles.cardTitle}>Total Cabezas</h3>
                        <div className={styles.statValue} style={{ fontSize: '3.5rem', color: '#3b82f6' }}>{totalAnimals}</div>
                        <div style={{ color: '#cbd5e1' }}>Animales en {livestockFields.length} campos</div>
                    </div>

                    <div className={styles.card} onClick={() => setSelectedCategory({ key: 'cows', label: 'Vacas' })} style={{ cursor: 'pointer' }}>
                        <h3 className={styles.cardTitle}>Vacas</h3>
                        <div className={styles.statValue}>{totalCows}</div>
                    </div>

                    <div className={styles.card} onClick={() => setSelectedCategory({ key: 'bulls', label: 'Toros' })} style={{ cursor: 'pointer' }}>
                        <h3 className={styles.cardTitle}>Toros</h3>
                        <div className={styles.statValue}>{totalBulls}</div>
                    </div>

                    <div className={styles.card} onClick={() => setSelectedCategory({ key: 'steers', label: 'Novillos' })} style={{ cursor: 'pointer' }}>
                        <h3 className={styles.cardTitle}>Novillos</h3>
                        <div className={styles.statValue}>{totalSteers}</div>
                    </div>

                    <div className={styles.card} onClick={() => setSelectedCategory({ key: 'youngSteers', label: 'Novillitos' })} style={{ cursor: 'pointer' }}>
                        <h3 className={styles.cardTitle}>Novillitos</h3>
                        <div className={styles.statValue}>{totalYoungSteers}</div>
                    </div>

                    <div className={styles.card} onClick={() => setSelectedCategory({ key: 'heifers', label: 'Vaquillonas' })} style={{ cursor: 'pointer' }}>
                        <h3 className={styles.cardTitle}>Vaquillonas</h3>
                        <div className={styles.statValue}>{totalHeifers}</div>
                    </div>

                    <div className={styles.card} onClick={() => setSelectedCategory({ key: 'maleCalves', label: 'Terneros' })} style={{ cursor: 'pointer' }}>
                        <h3 className={styles.cardTitle}>Terneros</h3>
                        <div className={styles.statValue}>{totalMaleCalves}</div>
                    </div>

                    <div className={styles.card} onClick={() => setSelectedCategory({ key: 'femaleCalves', label: 'Terneras' })} style={{ cursor: 'pointer' }}>
                        <h3 className={styles.cardTitle}>Terneras</h3>
                        <div className={styles.statValue}>{totalFemaleCalves}</div>
                    </div>
                </div>

                {/* Modal for Chart */}
                {selectedCategory && createPortal(
                    <div className={styles.modalOverlay} onClick={(e) => {
                        if (e.target === e.currentTarget) setSelectedCategory(null);
                    }}>
                        <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
                            <h2 className={styles.h2}>Histórico: {selectedCategory.label}</h2>
                            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                                No hay datos históricos disponibles.
                            </p>

                            <div style={{ height: '300px', width: '100%', marginBottom: '2rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={[]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#94a3b8"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short' })}
                                        />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={selectedCategory.key}
                                            name={selectedCategory.label}
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3b82f6' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </CommonLayout>
    );
};
