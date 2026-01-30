import { useState } from "react";
import { Link } from "wouter";
import { useField, useUpdateField, useLivestockHistory } from "@/services/FieldServices";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import styles from "./FieldDetailScreen.module.css";
import { createPortal } from "react-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const FieldLivestockScreen = ({ id }: { id: number }) => {
    const { data: field, isLoading, error } = useField(id);
    const { data: history } = useLivestockHistory(id);
    const { mutateAsync: updateField, isPending: isUpdating } = useUpdateField();

    const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);

    const animalTypes = [
        { key: 'cows', label: 'Vacas' },
        { key: 'bulls', label: 'Toros' },
        { key: 'steers', label: 'Novillos' },
        { key: 'youngSteers', label: 'Novillitos' },
        { key: 'heifers', label: 'Vaquillonas' },
        { key: 'maleCalves', label: 'Terneros' },
        { key: 'femaleCalves', label: 'Terneras' },
    ];

    if (isLoading) return <CommonLayout><div className={styles.container}><h2 style={{ color: 'white' }}>Cargando...</h2></div></CommonLayout>;
    if (error || !field) return <CommonLayout><div className={styles.container}><h2 style={{ color: 'white' }}>Error al cargar</h2></div></CommonLayout>;

    const totalHeads = animalTypes.reduce((acc, type) => acc + (field[type.key as keyof typeof field] as number || 0), 0);

    const handleCardClick = (key: string) => {
        const val = field[key as keyof typeof field] as number || 0;
        setEditValue(val);
        setSelectedAnimal(key);
    };

    const handleSave = async () => {
        if (!selectedAnimal) return;
        try {
            await updateField({
                id,
                data: {
                    [selectedAnimal]: editValue
                }
            });
            setSelectedAnimal(null);
        } catch (e) {
            console.error(e);
            alert("Error al guardar");
        }
    };

    // Prepare chart data
    const chartData = (history || []).map(h => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
        count: selectedAnimal ? (h[selectedAnimal as keyof typeof h] as number || 0) : 0,
        total: (h.cows || 0) + (h.bulls || 0) + (h.steers || 0) + (h.youngSteers || 0) + (h.heifers || 0) + (h.maleCalves || 0) + (h.femaleCalves || 0)
    }));

    // If no history, show at least current point? Or let empty.

    return (
        <CommonLayout contentStyle={{ maxWidth: '100%' }}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <Link href={`/fields/${id}`}>
                            <a className={styles.backButton} style={{ display: 'inline-flex', marginBottom: '1rem' }}>← Volver al Campo</a>
                        </Link>
                        <h1 className={styles.title}>Ganadería: {field.name}</h1>
                    </div>
                </header>

                <div className={styles.dashboardGrid}>
                    {/* Total Card */}
                    <div className={styles.card} onClick={() => {
                        setSelectedAnimal('total');
                    }} style={{ cursor: 'pointer', border: '2px solid #3b82f6' }}>
                        <h3 className={styles.cardTitle}>Cabezas Totales</h3>
                        <div className={styles.statValue} style={{ fontSize: '3rem', color: '#3b82f6' }}>
                            {totalHeads}
                        </div>
                    </div>

                    {animalTypes.map(type => (
                        <div key={type.key} className={styles.card} onClick={() => handleCardClick(type.key)} style={{ cursor: 'pointer' }}>
                            <h3 className={styles.cardTitle}>{type.label}</h3>
                            <div className={styles.statValue}>
                                {field[type.key as keyof typeof field] || 0}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal for Edit/Chart */}
                {selectedAnimal && createPortal(
                    <div className={styles.modalOverlay} onClick={(e) => {
                        if (e.target === e.currentTarget) setSelectedAnimal(null);
                    }}>
                        <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
                            <h2 className={styles.h2}>
                                {selectedAnimal === 'total' ? 'Cabezas Totales' : animalTypes.find(t => t.key === selectedAnimal)?.label}
                            </h2>

                            {/* Chart */}
                            <div style={{ height: '300px', width: '100%', marginBottom: '2rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="date" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={selectedAnimal === 'total' ? 'total' : 'count'}
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3b82f6' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                                {chartData.length === 0 && <p style={{ textAlign: 'center', color: '#64748b' }}>No hay datos históricos aún.</p>}
                            </div>

                            {/* Edit Input (Only if not total) */}
                            {selectedAnimal !== 'total' && (
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Cantidad Actual</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            min="0"
                                            value={editValue}
                                            onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                                        />
                                        <button
                                            className={styles.submitButton}
                                            style={{ width: 'auto', padding: '0 2rem' }}
                                            onClick={handleSave}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                className={styles.cancelButton}
                                onClick={() => setSelectedAnimal(null)}
                                style={{ marginTop: '1rem' }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </CommonLayout>
    );
};
