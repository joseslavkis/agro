import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import styles from "./Livestock.module.css";
import detailStyles from "@/screens/FieldDetailScreen.module.css";
import { useLivestockExpenses, useUpdateLivestockExpense, useDeleteLivestockExpense } from "@/services/LivestockExpenseService";
import { useMyFields } from "@/services/FieldServices";
import { useExchangeRate, formatCurrency } from "@/services/FinancialService";
import { LivestockExpenseResponse } from "@/models/LivestockExpense";
import { ConfirmationModal } from "@/components/Common/ConfirmationModal";

export const ExpenseHistory = () => {
    const { data: expenses, isLoading } = useLivestockExpenses();
    const { data: fields } = useMyFields();
    const { data: exchangeRateData } = useExchangeRate();
    const { mutateAsync: updateExpense, isPending: isUpdating } = useUpdateLivestockExpense();
    const { mutateAsync: deleteExpense, isPending: isDeleting } = useDeleteLivestockExpense();

    const [editingExpense, setEditingExpense] = useState<LivestockExpenseResponse | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Edit form state
    const [editName, setEditName] = useState("");
    const [editFieldId, setEditFieldId] = useState<string>("");
    const [editCost, setEditCost] = useState("");
    const [editCurrency, setEditCurrency] = useState<'USD' | 'ARS'>('USD');
    const [editNote, setEditNote] = useState("");
    const [editDate, setEditDate] = useState("");

    const totalExpensesUSD = expenses?.reduce((sum, e) => sum + (e.costUSD || 0), 0) || 0;

    const openEdit = (expense: LivestockExpenseResponse) => {
        setEditingExpense(expense);
        setEditName(expense.name);
        setEditFieldId(expense.fieldId?.toString() || "");
        setEditCost(expense.cost.toString());
        setEditCurrency((expense.currency as 'USD' | 'ARS') || 'USD');
        setEditNote(expense.note || "");
        setEditDate(expense.date);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExpense) return;

        try {
            await updateExpense({
                id: editingExpense.id,
                data: {
                    name: editName.trim(),
                    fieldId: editFieldId ? parseInt(editFieldId) : null,
                    cost: parseFloat(editCost),
                    currency: editCurrency,
                    exchangeRate: editCurrency === 'ARS' && exchangeRateData ? exchangeRateData.rate : null,
                    note: editNote.trim() || null,
                    date: editDate,
                }
            });
            setEditingExpense(null);
            toast.success("Gasto actualizado correctamente");
        } catch (error: any) {
            toast.error("Error: " + (error.message || "Error al actualizar"));
        }
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        try {
            await deleteExpense(deleteId);
            setDeleteId(null);
            toast.success("Gasto eliminado correctamente");
        } catch (error: any) {
            toast.error("Error: " + (error.message || "Error al eliminar"));
        }
    };

    return (
        <>
            <div className={detailStyles.card} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className={detailStyles.cardTitle} style={{ borderBottom: 'none', marginBottom: 0 }}>
                        Historial de Gastos
                    </h3>
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Total: </span>
                        <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {formatCurrency(totalExpensesUSD, 'USD')}
                        </span>
                    </div>
                </div>

                {isLoading ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Cargando gastos...</p>
                ) : !expenses || expenses.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: '#64748b',
                        padding: '3rem 1rem',
                        background: 'rgba(30, 41, 59, 0.5)',
                        borderRadius: '0.5rem',
                        border: '1px dashed #334155'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                        <p>Aún no hay gastos registrados.</p>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            Usa la tarjeta "Registrar Gasto" para agregar uno.
                        </p>
                    </div>
                ) : (
                    <div className={styles.historyList}>
                        {expenses.map((expense) => (
                            <div key={expense.id} className={styles.historyItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '1rem' }}>
                                            {expense.name}
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                            {new Date(expense.date + 'T12:00:00').toLocaleDateString('es-AR', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                            {expense.fieldName && (
                                                <span style={{ marginLeft: '0.5rem', color: '#60a5fa' }}>
                                                    📍 {expense.fieldName}
                                                </span>
                                            )}
                                        </div>
                                        {expense.note && (
                                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                                {expense.note}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {formatCurrency(expense.costUSD, 'USD')}
                                        </div>
                                        {expense.currency !== 'USD' && (
                                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                ({expense.currency} {expense.cost.toFixed(2)})
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => openEdit(expense)}
                                        style={{
                                            background: 'rgba(59, 130, 246, 0.15)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            color: '#93c5fd',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(expense.id)}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#fca5a5',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingExpense && createPortal(
                <div className={detailStyles.modalOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) setEditingExpense(null);
                }}>
                    <div className={detailStyles.modalContent} style={{ maxWidth: '500px' }}>
                        <h2 className={detailStyles.h2}>Editar Gasto</h2>

                        <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className={detailStyles.inputGroup}>
                                <label className={detailStyles.label}>Nombre del Gasto *</label>
                                <input
                                    type="text"
                                    className={detailStyles.input}
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={detailStyles.inputGroup}>
                                <label className={detailStyles.label}>Campo Relacionado (Opcional)</label>
                                <select className={detailStyles.input} value={editFieldId} onChange={e => setEditFieldId(e.target.value)}>
                                    <option value="">-- Sin campo específico --</option>
                                    {fields?.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={detailStyles.inputGroup}>
                                <label className={detailStyles.label}>Moneda</label>
                                <select className={detailStyles.input} value={editCurrency} onChange={e => setEditCurrency(e.target.value as 'USD' | 'ARS')}>
                                    <option value="USD">Dólares (USD)</option>
                                    <option value="ARS">Pesos (ARS)</option>
                                </select>
                            </div>

                            <div className={detailStyles.inputGroup}>
                                <label className={detailStyles.label}>Costo ({editCurrency}) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className={detailStyles.input}
                                    value={editCost}
                                    onChange={e => setEditCost(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={detailStyles.inputGroup}>
                                <label className={detailStyles.label}>Fecha *</label>
                                <input
                                    type="date"
                                    className={detailStyles.input}
                                    value={editDate}
                                    onChange={e => setEditDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={detailStyles.inputGroup}>
                                <label className={detailStyles.label}>Nota (Opcional)</label>
                                <textarea
                                    className={detailStyles.input}
                                    rows={3}
                                    value={editNote}
                                    onChange={e => setEditNote(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className={detailStyles.cancelButton}
                                    onClick={() => setEditingExpense(null)}
                                    disabled={isUpdating}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={detailStyles.submitButton}
                                    disabled={isUpdating}
                                    style={{ flex: 1, marginTop: 0, width: '100%' }}
                                >
                                    {isUpdating ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={deleteId !== null}
                title="¿Eliminar gasto?"
                message="Esta acción no se puede deshacer. El gasto se eliminará permanentemente junto con su evento de agenda asociado."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                isProcessing={isDeleting}
            />
        </>
    );
};
