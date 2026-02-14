import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import detailStyles from "@/screens/FieldDetailScreen.module.css";
import { useCreateLivestockExpense } from "@/services/LivestockExpenseService";
import { useMyFields } from "@/services/FieldServices";
import { useExchangeRate } from "@/services/FinancialService";

export const ExpenseForm = () => {
    const { mutateAsync: createExpense, isPending } = useCreateLivestockExpense();
    const { data: fields } = useMyFields();
    const { data: exchangeRateData } = useExchangeRate();
    const [isOpen, setIsOpen] = useState(false);

    const [name, setName] = useState("");
    const [fieldId, setFieldId] = useState<string>("");
    const [cost, setCost] = useState<string>("");
    const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
    const [note, setNote] = useState<string>("");
    const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-CA'));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return toast.error("Ingrese un nombre para el gasto");
        if (!cost || parseFloat(cost) <= 0) return toast.error("Ingrese un costo válido");

        try {
            await createExpense({
                name: name.trim(),
                fieldId: fieldId ? parseInt(fieldId) : null,
                cost: parseFloat(cost),
                currency,
                exchangeRate: currency === 'ARS' && exchangeRateData ? exchangeRateData.rate : null,
                note: note.trim() || null,
                date,
            });

            // Reset form
            setName("");
            setFieldId("");
            setCost("");
            setCurrency('USD');
            setNote("");
            setDate(new Date().toLocaleDateString('en-CA'));
            setIsOpen(false);
            toast.success("Gasto registrado correctamente");
        } catch (error: any) {
            console.error(error);
            toast.error("Error: " + (error.message || "Error desconocido"));
        }
    };

    if (!isOpen) {
        return (
            <div
                className={detailStyles.card}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                    minHeight: '200px',
                    cursor: 'pointer',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    margin: 0
                }}
                onClick={() => setIsOpen(true)}
            >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.4))' }}>💸</div>
                <h3 className={detailStyles.cardTitle} style={{ margin: 0, borderBottom: 'none' }}>Registrar Gasto</h3>
                <p style={{ color: '#fca5a5', textAlign: 'center', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    Vacunas, servicios, alambrados...
                </p>
            </div>
        );
    }

    return createPortal(
        <div className={detailStyles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
        }}>
            <div className={detailStyles.modalContent} style={{ maxWidth: '500px' }}>
                <h2 className={detailStyles.h2}>Registrar Gasto de Hacienda</h2>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>

                    {/* Expense Name */}
                    <div className={detailStyles.inputGroup}>
                        <label className={detailStyles.label}>Nombre del Gasto *</label>
                        <input
                            type="text"
                            className={detailStyles.input}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ej. Vacunación Aftosa, Alambrado..."
                            required
                        />
                    </div>

                    {/* Field (Optional) */}
                    <div className={detailStyles.inputGroup}>
                        <label className={detailStyles.label}>Campo Relacionado (Opcional)</label>
                        <select
                            className={detailStyles.input}
                            value={fieldId}
                            onChange={e => setFieldId(e.target.value)}
                        >
                            <option value="">-- Sin campo específico --</option>
                            {fields?.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Currency */}
                    <div className={detailStyles.inputGroup}>
                        <label className={detailStyles.label}>Moneda</label>
                        <select
                            className={detailStyles.input}
                            value={currency}
                            onChange={e => setCurrency(e.target.value as 'USD' | 'ARS')}
                        >
                            <option value="USD">Dólares (USD)</option>
                            <option value="ARS">Pesos (ARS)</option>
                        </select>
                    </div>

                    {/* Cost */}
                    <div className={detailStyles.inputGroup}>
                        <label className={detailStyles.label}>Costo ({currency}) *</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={detailStyles.input}
                            value={cost}
                            onChange={e => setCost(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    {currency === 'ARS' && cost && (
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                            <small style={{ color: '#93c5fd' }}>
                                💱 Se convertirá automáticamente a USD usando cotización oficial
                                {exchangeRateData && ` (1 USD = AR$${exchangeRateData.rate.toFixed(2)})`}
                            </small>
                        </div>
                    )}

                    {/* Date */}
                    <div className={detailStyles.inputGroup}>
                        <label className={detailStyles.label}>Fecha *</label>
                        <input
                            type="date"
                            className={detailStyles.input}
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Note (Optional) */}
                    <div className={detailStyles.inputGroup}>
                        <label className={detailStyles.label}>Nota (Opcional)</label>
                        <textarea
                            className={detailStyles.input}
                            rows={3}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Detalles adicionales..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            className={detailStyles.cancelButton}
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={detailStyles.submitButton}
                            disabled={isPending}
                            style={{ flex: 1, marginTop: 0, width: '100%' }}
                        >
                            {isPending ? "Guardando..." : "Registrar Gasto"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};
