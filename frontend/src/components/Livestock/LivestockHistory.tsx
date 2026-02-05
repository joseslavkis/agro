import React from "react";
import { useLivestockTransactions } from "@/services/LivestockService";
import { ActionLabels, CategoryLabels, LivestockActionType, LivestockTransactionResponse } from "@/models/Livestock";
import styles from "./Livestock.module.css";
import { LivestockTransactionEditModal } from "./LivestockTransactionEditModal";

export const LivestockHistory = () => {
    const { data: transactions, isLoading } = useLivestockTransactions();
    const [selectedTransaction, setSelectedTransaction] = React.useState<LivestockTransactionResponse | null>(null);

    if (isLoading) return <div style={{ color: '#94a3b8' }}>Cargando historial...</div>;

    if (!transactions || transactions.length === 0) {
        return <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay movimientos recientes.</div>;
    }

    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) {
            return dateB - dateA;
        }
        return b.id - a.id;
    });

    return (
        <div className={styles.historyList}>
            <h2 className={styles.title} style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Historial de Movimientos</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Haga clic en un movimiento para editarlo o corregirlo.
            </p>
            {sortedTransactions.map(t => {
                const actionLabel = ActionLabels[t.actionType] || t.actionType;
                const categoryLabel = CategoryLabels[t.category] || t.category;

                let dateDisplay = "Fecha desconocida";
                try {
                    if (t.date) {
                        const dateObj = new Date(t.date);
                        // If invalid date (NaN)
                        if (!isNaN(dateObj.getTime())) {
                            // Fix timezone offset issue by treating YYYY-MM-DD as UTC or appending usage T00:00:00
                            // A safer way for display is using the split if we trust format, but fallback to direct Date parse
                            if (typeof t.date === 'string' && t.date.includes('-')) {
                                const [y, m, d] = t.date.split('-');
                                dateDisplay = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString();
                            } else {
                                dateDisplay = dateObj.toLocaleDateString();
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing date", t.date, e);
                }

                return (
                    <div
                        key={t.id}
                        className={styles.historyItem}
                        onClick={() => setSelectedTransaction(t)}
                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className={`${styles.historyBadge} ${styles[`badge-${t.actionType}`] || ''}`}>
                                    {actionLabel}
                                </span>
                                <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                                    {t.quantity} {categoryLabel}
                                </span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                {formatDescription(t)}
                            </div>
                            {t.notes && <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>"{t.notes}"</div>}
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.85rem', textAlign: 'right' }}>
                            {dateDisplay}
                        </div>
                    </div>
                )
            })}

            {selectedTransaction && (
                <LivestockTransactionEditModal
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
        </div>
    );
};

function formatDescription(t: any): string {
    switch (t.actionType) {
        case LivestockActionType.BIRTH:
            return `Nacido en ${t.targetFieldName}`;
        case LivestockActionType.DEATH:
            return `Murió en ${t.sourceFieldName}`;
        case LivestockActionType.MOVE:
            return `De ${t.sourceFieldName} a ${t.targetFieldName}`;
        case LivestockActionType.SALE:
            return `Vendido desde ${t.sourceFieldName}`;
        case LivestockActionType.PURCHASE:
            return `Comprado para ${t.targetFieldName}`;
        default:
            return "";
    }
}
