import { useState } from "react";
import { createPortal } from "react-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from "@/screens/FieldDetailScreen.module.css"; // Reuse card styles
import summaryStyles from "./Livestock.module.css";
import { LivestockCategory, CategoryLabels } from "@/models/Livestock";
import { useLivestockTransactions } from "@/services/LivestockService";

interface LivestockSummaryProps {
    fields: any[]; // User's fields
}

export const LivestockSummary = ({ fields }: LivestockSummaryProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<{ key: string, label: string } | null>(null);
    const { data: transactions } = useLivestockTransactions();

    // Calculate current totals from fields (Snapshot of NOW)
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

    // Helper to calculate stock differences based on action type
    const getDelta = (actionType: string, quantity: number): number => {
        // We are walking BACKWARDS in time.
        // If the action added stock (BIRTH, PURCHASE), in the past it was LOWER. So we SUBTRACT.
        // If the action removed stock (DEATH, SALE), in the past it was HIGHER. So we ADD.
        // MOVE is special: if target is THIS category (unlikely for move unless field->field), it adds.
        // But here we are global. MOVES usually don't change global count unless it's strictly internal field-to-field?
        // Wait, moves are field-to-field. Global count DOES NOT CHANGE for local moves between user's fields.
        // BUT, if we moved FROM outside? No, system assumes moves are internal or external?
        // API Definitions:
        // BIRTH: +
        // DEATH: -
        // PURCHASE: +
        // SALE: -
        // MOVE: 0 change globally (just location change), UNLESS we filter by field? Here we show GLOBAL total.
        // So for global chart, MOVEs should be ignored for the TOTAL count unless they are in/out of system?
        // Assuming MOVE is internal transfer. Global sum remains same.

        // Wait, 'category' is per transaction. 
        // If I move Cows from Field A to Field B, total Cows is same.
        // Does transaction have 'category'? Yes.

        switch (actionType) {
            case 'BIRTH': return quantity;      // + in present => - in past (to get to prev state)
            case 'PURCHASE': return quantity;   // + in present => - in past
            case 'DEATH': return -quantity;     // - in present => + in past
            case 'SALE': return -quantity;      // - in present => + in past
            case 'MOVE': return 0;              // Internal move, no global change
            default: return 0;
        }
    };

    const prepareChartData = () => {
        if (!selectedCategory || !transactions) return [];

        const catKey = selectedCategory.key;
        const currentStock = totals[catKey];

        // 1. Filter relevant transactions for this category
        const relevantTransactions = transactions
            .filter((t: any) => t.category === catKey)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id); // Newest first

        // 2. Build history points walking backwards
        // Start with current state (Now)
        const historyPoints: { date: string, value: number, timestamp: number, fullDate: string | Date }[] = [];

        // Push "Now" point
        historyPoints.push({
            date: 'Hoy',
            value: currentStock,
            timestamp: new Date().getTime(),
            fullDate: new Date()
        });

        let runningStock = currentStock;

        relevantTransactions.forEach((t: any) => {
            const tDate = new Date(t.date);
            // Verify date validity
            if (isNaN(tDate.getTime())) return;

            // Before this transaction happened, the stock was DIFFERENT.
            // We need to REVERSE the operation to find the "before" state.

            // Effect of transaction on stock:
            // BIRTH (+q) -> Before it was (Stock - q)
            // DEATH (-q) -> Before it was (Stock + q)

            // So: PreviousStock = CurrentStock - (Effect)
            // Effect is: +q for Additions, -q for Subtractions.
            // My getDelta returns the Effect.
            // So: Previous = Running - getDelta()

            // However, we want to show the state AFTER the transaction for that date?
            // Or the state change? 
            // The user wants to see the "movement".
            // Chart line:
            // Point A (Now): 100
            // Transaction yesterday: +10 Births.
            // So yesterday AFTER the birth it was 100? No, today is 100 because of yesterday.
            // So yesterday BEFORE the birth it was 90.

            // We want to plot the value AT THE END of that transaction's moment.
            // If T1 happened at 2023-01-02, creating 10 cows.
            // Then at 2023-01-02 end of day, we have X cows.

            // Let's walk back.
            // Now (User View): 100 Cows.
            // T1 (Yesterday): BIRTH 10.
            // Logic: The 100 includes the 10.
            // So BEFORE T1, we had 90.

            // We record the point for T1's date as 100 (because that's what it became/was at that time).
            // AND we need a point for "Just before T1" to show the step? 
            // Or just the daily values? 
            // User: "se mueva el grafico segun cada movimiento".
            // So if I have 2 movements today.
            // Now: 100.
            // T_Latest (Today): Sale 5. (So before this, we had 105).
            // T_Earlier (Today): Purchase 10. (So before this, we had 95).

            // Sequence in Time:
            // Start: 95.
            // Purchase 10 -> 105.
            // Sale 5 -> 100.

            // Reverse Walk:
            // Start: 100 (Now).

            // Process T_Latest (Sale 5, Effect -5).
            // Value AFTER T_Latest was 100.
            // Value BEFORE T_Latest was 100 - (-5) = 105.

            // Process T_Earlier (Purchase 10, Effect +10).
            // Value AFTER T_Earlier was 105.
            // Value BEFORE T_Earlier was 105 - (+10) = 95.

            // Plotting:
            // for chart, we usually want time ascending.
            // Date: T_Latest Date. Value: 100.
            // Date: T_Earlier Date. Value: 105.

            // Wait, if I explicitly map points: 
            // Point 1: Time=Today, Value=100
            // Point 2: Time=Today(Earlier), Value=105 (This is the state before the Sale)

            const effect = getDelta(t.actionType, t.quantity);

            // If effect is 0 (Move), we skip logical change but maybe keep point?
            if (effect === 0) return;

            // The 'runningStock' is the value AFTER this transaction occurred (in forward time).
            // So calculate Pre-Transaction Value
            const preTransactionStock = runningStock - effect;

            // Record the state BEFORE this transaction as the next point in our reverse walk
            historyPoints.push({
                date: tDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: preTransactionStock,
                fullDate: t.date,
                timestamp: tDate.getTime()
            });

            // Update running stock to be the pre-transaction value
            runningStock = preTransactionStock;
        });

        // The 'historyPoints' now contains:
        // [Now (100), Post-T_Earlier (105), Post-Start (95)]?
        // Wait.
        // 1. Push 100 (Now).
        // 2. Loop T_Latest (Sale -5). Effect -5.
        //    Pre = 100 - (-5) = 105.
        //    Push 105. (This represents state BEFORE Sale).
        //    Running = 105.
        // 3. Loop T_Earlier (Buy +10). Effect +10.
        //    Pre = 105 - 10 = 95.
        //    Push 95. (State BEFORE Buy).
        //    Running = 95.

        // Correct?
        // Forward: 95 -> Buy 10 -> 105 -> Sale 5 -> 100.
        // Chart should show: 95, 105, 100.
        // My reverse array: 100, 105, 95.
        // So I just need to reverse the array at the end.

        return historyPoints.reverse().map(p => ({
            date: p.date,
            value: p.value,
            fullDate: p.date
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

            <div className={styles.dashboardGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                {/* Render a card for each category */}
                {(Object.keys(totals) as LivestockCategory[]).map(key => (
                    <div key={key} className={styles.card} onClick={() => setSelectedCategory({ key, label: CategoryLabels[key] })}
                        style={{ cursor: 'pointer', padding: '1rem', minHeight: 'auto' }}>
                        <h3 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{CategoryLabels[key]}</h3>
                        <div className={styles.statValue} style={{ fontSize: '1.5rem' }}>{totals[key]}</div>
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
                                        formatter={(value: any) => [`${value} Cabezas`, 'Stock']}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#60a5fa' }} animationDuration={500} />
                                </LineChart>
                            </ResponsiveContainer>
                            {/* Empty state message */}
                            {chartData.length <= 1 && (
                                <div style={{ textAlign: 'center', color: '#64748b', marginTop: '-150px' }}>
                                    Aún no hay suficientes movimientos históricos.
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
