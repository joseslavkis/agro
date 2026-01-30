import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import detailStyles from "@/screens/FieldDetailScreen.module.css";
import { LivestockActionType, LivestockCategory, CategoryLabels, LivestockTransactionCreate, ActionLabels } from "@/models/Livestock";
import { useCreateLivestockTransaction } from "@/services/LivestockService";

interface LivestockActionFormProps {
    fields: any[]; // User's fields
}

export const LivestockActionForm = ({ fields }: LivestockActionFormProps) => {
    const { mutateAsync: createTransaction, isPending } = useCreateLivestockTransaction();
    const [isOpen, setIsOpen] = useState(false);

    const [actionType, setActionType] = useState<LivestockActionType>(LivestockActionType.BIRTH);
    const [sourceFieldId, setSourceFieldId] = useState<string>("");
    const [targetFieldId, setTargetFieldId] = useState<string>("");
    const [category, setCategory] = useState<LivestockCategory>(LivestockCategory.MALE_CALVES);
    const [quantity, setQuantity] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    // Filter fields that have livestock enabled
    const livestockFields = fields.filter(f => f.hasLivestock);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload: LivestockTransactionCreate = {
                actionType,
                category,
                quantity: parseInt(quantity),
                date: new Date().toLocaleDateString('en-CA'), // Local YYYY-MM-DD
                notes: notes || undefined,
            };

            if (actionType === LivestockActionType.MOVE) {
                if (!sourceFieldId) return toast.error("Seleccione campo origen");
                if (!targetFieldId) return toast.error("Seleccione campo destino");
                if (sourceFieldId === targetFieldId) return toast.error("Origen y destino deben ser diferentes");
                payload.sourceFieldId = parseInt(sourceFieldId);
                payload.targetFieldId = parseInt(targetFieldId);
            } else if (actionType === LivestockActionType.BIRTH || actionType === LivestockActionType.PURCHASE) {
                if (!targetFieldId) return toast.error("Seleccione campo destino");
                payload.targetFieldId = parseInt(targetFieldId);
            } else {
                if (!sourceFieldId) return toast.error("Seleccione campo origen");
                payload.sourceFieldId = parseInt(sourceFieldId);
            }

            await createTransaction(payload);

            // Reset form and close
            setQuantity("");
            setNotes("");
            setIsOpen(false);
            toast.success("Operación registrada correctamente");
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
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    margin: 0
                }}
                onClick={() => setIsOpen(true)}
            >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 15px rgba(250, 204, 21, 0.4))' }}>⚡</div>
                <h3 className={detailStyles.cardTitle} style={{ margin: 0, borderBottom: 'none' }}>Registrar Movimiento</h3>
                <p style={{ color: '#93c5fd', textAlign: 'center', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    Nacimientos, bajas, traslados...
                </p>
            </div>
        );
    }

    return createPortal(
        <div className={detailStyles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
        }}>
            <div className={detailStyles.modalContent} style={{ maxWidth: '500px' }}>
                <h2 className={detailStyles.h2}>Modificar Hacienda</h2>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>

                    {/* Action Type Select */}
                    <div className={detailStyles.inputGroup}>
                        <label className={detailStyles.label}>Tipo de Movimiento</label>
                        <select className={detailStyles.input} value={actionType} onChange={e => setActionType(e.target.value as LivestockActionType)} required>
                            <option value={LivestockActionType.BIRTH}>{ActionLabels[LivestockActionType.BIRTH]}</option>
                            <option value={LivestockActionType.DEATH}>{ActionLabels[LivestockActionType.DEATH]}</option>
                            {livestockFields.length > 1 && (
                                <option value={LivestockActionType.MOVE}>{ActionLabels[LivestockActionType.MOVE]}</option>
                            )}
                            <option value={LivestockActionType.SALE}>{ActionLabels[LivestockActionType.SALE]}</option>
                            <option value={LivestockActionType.PURCHASE}>{ActionLabels[LivestockActionType.PURCHASE]}</option>
                        </select>
                    </div>

                    {/* Source Field: For Move, Death, Sale */}
                    {(actionType === LivestockActionType.MOVE || actionType === LivestockActionType.DEATH || actionType === LivestockActionType.SALE) && (
                        <div className={detailStyles.inputGroup}>
                            <label className={detailStyles.label}>
                                {actionType === LivestockActionType.MOVE ? "Desde Campo" : "En Campo"}
                            </label>
                            <select className={detailStyles.input} value={sourceFieldId} onChange={e => setSourceFieldId(e.target.value)} required>
                                <option value="">Seleccionar...</option>
                                {livestockFields.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Target Field: For Move, Birth, Purchase */}
                    {(actionType === LivestockActionType.MOVE || actionType === LivestockActionType.BIRTH || actionType === LivestockActionType.PURCHASE) && (
                        <div className={detailStyles.inputGroup}>
                            <label className={detailStyles.label}>
                                {actionType === LivestockActionType.MOVE ? "Hacia Campo" : "En Campo"}
                            </label>
                            <select className={detailStyles.input} value={targetFieldId} onChange={e => setTargetFieldId(e.target.value)} required>
                                <option value="">Seleccionar...</option>
                                {livestockFields.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Category */}
                    <div className={detailStyles.inputGroup}>
                        <label className={detailStyles.label}>Categoría</label>
                        <select className={detailStyles.input} value={category} onChange={e => setCategory(e.target.value as LivestockCategory)} required>
                            {Object.entries(CategoryLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div className={detailStyles.inputGroup}>
                        <label className={detailStyles.label}>Cantidad</label>
                        <input
                            type="number"
                            min="1"
                            className={detailStyles.input}
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            required
                        />
                    </div>

                    {/* Notes (Full width) */}
                    <div className={detailStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={detailStyles.label}>Notas (Opcional)</label>
                        <textarea
                            className={detailStyles.input}
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
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
                            {isPending ? "Procesando..." : "Confirmar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};
