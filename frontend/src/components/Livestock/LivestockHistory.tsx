import { useLivestockTransactions } from "@/services/LivestockService";
import { ActionLabels, CategoryLabels, LivestockActionType } from "@/models/Livestock";
import styles from "./Livestock.module.css";

export const LivestockHistory = () => {
    const { data: transactions, isLoading } = useLivestockTransactions();

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
            {sortedTransactions.map(t => (
                <div key={t.id} className={styles.historyItem}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`${styles.historyBadge} ${styles[`badge-${t.actionType}`]}`}>
                                {ActionLabels[t.actionType]}
                            </span>
                            <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                                {t.quantity} {CategoryLabels[t.category]}
                            </span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                            {formatDescription(t)}
                        </div>
                        {t.notes && <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>"{t.notes}"</div>}
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem', textAlign: 'right' }}>
                        {(() => {
                            const [y, m, d] = t.date.toString().split('-');
                            return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString();
                        })()}
                    </div>
                </div>
            ))}
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
