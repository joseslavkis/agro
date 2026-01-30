import { useState } from "react";
import { createPortal } from "react-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from "@/screens/FieldDetailScreen.module.css"; // Reuse card styles
import summaryStyles from "./Livestock.module.css";
import { LivestockCategory, CategoryLabels } from "@/models/Livestock";
import { useGlobalLivestockHistory, LivestockHistory } from "@/services/FieldServices";

interface LivestockSummaryProps {
    fields: any[]; // User's fields
}

export const LivestockSummary = ({ fields }: LivestockSummaryProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<{ key: string, label: string } | null>(null);
    const { data: history } = useGlobalLivestockHistory();

    // Calculate totals
    const totals: Record<string, number> = {
        [LivestockCategory.COWS]: 0,
        [LivestockCategory.BULLS]: 0,
        [LivestockCategory.STEERS]: 0,
        [LivestockCategory.YOUNG_STEERS]: 0,
        [LivestockCategory.HEIFERS]: 0,
        [LivestockCategory.MALE_CALVES]: 0,
        [LivestockCategory.FEMALE_CALVES]: 0,
    };

    fields.forEach(f => {
        if (f.hasLivestock) {
            totals[LivestockCategory.COWS] += (f.cows || 0);
            totals[LivestockCategory.BULLS] += (f.bulls || 0);
            totals[LivestockCategory.STEERS] += (f.steers || 0);
            totals[LivestockCategory.YOUNG_STEERS] += (f.youngSteers || 0);
            totals[LivestockCategory.HEIFERS] += (f.heifers || 0);
            totals[LivestockCategory.MALE_CALVES] += (f.maleCalves || 0);
            totals[LivestockCategory.FEMALE_CALVES] += (f.femaleCalves || 0);
        }
    });

    const totalAnimals = Object.values(totals).reduce((a, b) => a + b, 0);

    const getHistoryKey = (cat: string): keyof LivestockHistory | null => {
        switch (cat) {
            case LivestockCategory.COWS: return 'cows';
            case LivestockCategory.BULLS: return 'bulls';
            case LivestockCategory.STEERS: return 'steers';
            case LivestockCategory.YOUNG_STEERS: return 'youngSteers';
            case LivestockCategory.HEIFERS: return 'heifers';
            case LivestockCategory.MALE_CALVES: return 'maleCalves';
            case LivestockCategory.FEMALE_CALVES: return 'femaleCalves';
            default: return null;
        }
    };

    const prepareChartData = () => {
        if (!selectedCategory || !history) return [];
        const key = getHistoryKey(selectedCategory.key);
        if (!key) return [];

        return history.map(h => ({
            date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            value: h[key] as number,
            fullDate: h.date
        }));
    };

    const chartData = prepareChartData();

    // Check if we should render expanded or collapsed
    if (!isExpanded) {
        return (
            <div className={styles.card} onClick={() => setIsExpanded(true)} style={{ cursor: 'pointer', border: '2px solid #3b82f6', width: '100%', height: '100%', minHeight: '200px', margin: 0, justifyContent: 'center', alignItems: 'center' }}>
                <h3 className={styles.cardTitle} style={{ borderBottom: 'none', marginBottom: '0.5rem' }}>Total Cabezas</h3>
                <div className={styles.statValue} style={{ fontSize: '3.5rem', color: '#3b82f6' }}>{totalAnimals}</div>
                <div style={{ color: '#cbd5e1' }}>Click ver detalles</div>
            </div>
        );
    }

    return (
        <div className={styles.card} style={{ width: '100%', height: 'auto', minHeight: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className={summaryStyles.title}>Detalle de Hacienda</h2>
                <button
                    onClick={() => setIsExpanded(false)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    Colapsar ▲
                </button>
            </div>

            <div className={styles.dashboardGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {/* Render a card for each category */}
                {(Object.keys(totals) as LivestockCategory[]).map(key => (
                    <div key={key} className={styles.card} onClick={() => setSelectedCategory({ key, label: CategoryLabels[key] })} style={{ cursor: 'pointer' }}>
                        <h3 className={styles.cardTitle}>{CategoryLabels[key]}</h3>
                        <div className={styles.statValue}>{totals[key]}</div>
                    </div>
                ))}
            </div>

            {/* Modal for Chart */}
            {selectedCategory && createPortal(
                <div className={styles.modalOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedCategory(null);
                }}>
                    <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
                        <h2 className={styles.h2}>Histórico: {selectedCategory.label}</h2>

                        <div style={{ height: '300px', width: '100%', marginBottom: '2rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="date" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                                </LineChart>
                            </ResponsiveContainer>
                            {/* Empty state message */}
                            {chartData.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#64748b', marginTop: '-150px' }}>
                                    Aún no hay suficientes datos históricos.
                                </div>
                            )}
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
    );
};
