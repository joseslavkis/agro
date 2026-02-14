import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from "@/screens/FieldDetailScreen.module.css";
import { useLivestockTransactions } from "@/services/LivestockService";
import { useLivestockExpenses } from "@/services/LivestockExpenseService";
import { formatCurrency } from "@/services/FinancialService";

export const FinancialSummary = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: transactions } = useLivestockTransactions();
    const { data: livestockExpenses } = useLivestockExpenses();

    // Calculate financial summary
    const calculateFinancials = () => {
        if (!transactions && !livestockExpenses) return { income: 0, expenses: 0, balance: 0, history: [] };

        let income = 0;
        let expenses = 0;

        // History for chart
        const historyMap = new Map<string, { income: number, expenses: number, balance: number }>();

        // Process livestock transactions
        (transactions || [])
            .filter((t: any) => t.pricePerUnitUSD && t.totalValueUSD)
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .forEach((t: any) => {
                const dateKey = new Date(t.date).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });

                if (!historyMap.has(dateKey)) {
                    historyMap.set(dateKey, { income: 0, expenses: 0, balance: 0 });
                }

                const monthData = historyMap.get(dateKey)!;

                if (t.actionType === 'SALE') {
                    // Income from sale
                    const saleValue = Math.abs(t.totalValueUSD);
                    income += saleValue;
                    monthData.income += saleValue;
                } else if (t.actionType === 'PURCHASE') {
                    // Expense from purchase (ensure positive)
                    const purchaseValue = Math.abs(t.totalValueUSD);
                    expenses += purchaseValue;
                    monthData.expenses += purchaseValue;
                } else if (t.actionType === 'DEATH') {
                    // Loss is the value minus salvage (ensure positive, never negative)
                    const animalValue = Math.abs(t.totalValueUSD);
                    const salvage = Math.abs(t.salvageValueUSD || 0);
                    const loss = Math.max(0, animalValue - salvage); // Loss cannot be negative
                    expenses += loss;
                    monthData.expenses += loss;

                    if (salvage > 0) {
                        income += salvage;
                        monthData.income += salvage;
                    }
                }
            });

        // Process livestock expenses (general hacienda expenses)
        (livestockExpenses || [])
            .filter((e: any) => e.costUSD)
            .forEach((e: any) => {
                const dateKey = new Date(e.date).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });

                if (!historyMap.has(dateKey)) {
                    historyMap.set(dateKey, { income: 0, expenses: 0, balance: 0 });
                }

                const monthData = historyMap.get(dateKey)!;
                const expenseValue = Math.abs(e.costUSD);
                expenses += expenseValue;
                monthData.expenses += expenseValue;
            });

        // Build history array
        const history = Array.from(historyMap.entries()).map(([date, data]) => ({
            date,
            income: data.income,
            expenses: data.expenses,
            balance: data.income - data.expenses
        }));

        // Calculate cumulative balance
        let cumulativeBalance = 0;
        history.forEach(point => {
            cumulativeBalance += point.balance;
            point.balance = cumulativeBalance;
        });

        const balance = income - expenses;

        return { income, expenses, balance, history };
    };

    const { income, expenses, balance, history } = calculateFinancials();

    if (!isExpanded) {
        return (
            <div
                className={styles.card}
                onClick={() => setIsExpanded(true)}
                style={{
                    cursor: 'pointer',
                    border: '2px solid #10b981',
                    width: '100%',
                    height: '100%',
                    minHeight: '200px',
                    margin: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                }}
            >
                <h3 className={styles.cardTitle} style={{ borderBottom: 'none', marginBottom: '0.5rem' }}>💰 Balance USD</h3>
                <div
                    className={styles.statValue}
                    style={{
                        fontSize: '2.5rem',
                        color: balance >= 0 ? '#10b981' : '#ef4444'
                    }}
                >
                    {formatCurrency(balance, 'USD')}
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    <span style={{ color: '#10b981' }}>↑ {formatCurrency(income, 'USD')}</span>
                    {' • '}
                    <span style={{ color: '#ef4444' }}>↓ {formatCurrency(Math.abs(expenses), 'USD')}</span>
                </div>
                <div style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Click para detalles</div>
            </div>
        );
    }

    return (
        <div className={styles.card} style={{ width: '100%', height: 'auto', minHeight: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
                    Resumen Financiero
                </h2>
                <button
                    onClick={() => setIsExpanded(false)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    Colapsar ▲
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Ingresos</div>
                    <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {formatCurrency(income, 'USD')}
                    </div>
                </div>

                <div style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Egresos</div>
                    <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {formatCurrency(Math.abs(expenses), 'USD')}
                    </div>
                </div>

                <div style={{
                    padding: '1rem',
                    background: balance >= 0
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)',
                    borderRadius: '0.5rem',
                    border: `1px solid ${balance >= 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Balance</div>
                    <div style={{
                        color: balance >= 0 ? '#3b82f6' : '#ef4444',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                    }}>
                        {formatCurrency(balance, 'USD')}
                    </div>
                </div>
            </div>

            {/* Chart */}
            {history.length > 0 ? (
                <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                        Evolución del Balance (USD)
                    </h3>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        borderColor: '#334155',
                                        borderRadius: '0.5rem',
                                        padding: '0.75rem'
                                    }}
                                    labelStyle={{ color: '#cbd5e1', marginBottom: '0.5rem' }}
                                    formatter={(value: any, name?: string) => {
                                        const labels: Record<string, string> = {
                                            balance: 'Balance',
                                            income: 'Ingresos',
                                            expenses: 'Egresos'
                                        };
                                        return [formatCurrency(value, 'USD'), labels[name || ''] || name];
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#colorBalance)"
                                    animationDuration={500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    color: '#64748b',
                    padding: '3rem 1rem',
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '0.5rem',
                    border: '1px dashed #334155'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                    <p>Aún no hay transacciones con valores registrados.</p>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        Agrega precios a tus compras y ventas para ver gráficos financieros.
                    </p>
                </div>
            )}

            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0.5rem',
                borderLeft: '3px solid #3b82f6'
            }}>
                <div style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    ℹ️ Todos los valores en USD
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    Los precios en ARS se convierten automáticamente usando la cotización oficial del día de la transacción.
                    El balance preserva el valor real contra la inflación.
                </div>
            </div>
        </div>
    );
};
