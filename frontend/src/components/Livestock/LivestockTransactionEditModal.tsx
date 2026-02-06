import React, { useState } from "react";
import { createPortal } from "react-dom";
import { LivestockCategory, CategoryLabels, ActionLabels, LivestockTransactionResponse, LivestockTransactionCreate } from "@/models/Livestock";
import { useUpdateLivestockTransaction, useDeleteLivestockTransaction } from "@/services/LivestockService";
import { ConfirmationModal } from "@/components/Common/ConfirmationModal";
import styles from "./Livestock.module.css";

interface LivestockTransactionEditModalProps {
    transaction: LivestockTransactionResponse;
    onClose: () => void;
}

export const LivestockTransactionEditModal: React.FC<LivestockTransactionEditModalProps> = ({ transaction, onClose }) => {
    const updateMutation = useUpdateLivestockTransaction();
    const deleteMutation = useDeleteLivestockTransaction();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState<LivestockTransactionCreate>({
        sourceFieldId: transaction.sourceFieldId,
        targetFieldId: transaction.targetFieldId,
        category: transaction.category,
        quantity: transaction.quantity,
        actionType: transaction.actionType,
        date: transaction.date,
        notes: transaction.notes || "",
        // Financial fields
        pricePerUnit: transaction.pricePerUnit || null,
        currency: transaction.currency as 'USD' | 'ARS' | undefined || 'USD',
        exchangeRate: transaction.exchangeRate || null,
        salvageValue: transaction.salvageValue || null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({ id: transaction.id, data: formData });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al actualizar la transacción");
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(transaction.id);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al eliminar la transacción");
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    return createPortal(
        <div className={styles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles.modalContent}>
                <h2 className={styles.h2}>Editar Movimiento</h2>
                <form onSubmit={handleSubmit}>

                    {/* Read-only info about context */}
                    {/* Read-only info about context */}
                    <div className={styles.infoBox}>
                        <p className={styles.infoText}>
                            <strong>Tipo:</strong> {ActionLabels[transaction.actionType]} <br />
                            <strong>Origen:</strong> {transaction.sourceFieldName || '-'} <br />
                            <strong>Destino:</strong> {transaction.targetFieldName || '-'}
                        </p>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Cantidad</label>
                        <input
                            className={styles.input}
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Categoría</label>
                        <select
                            className={styles.select}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as LivestockCategory })}
                        >
                            {Object.entries(CategoryLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Fecha</label>
                        <input
                            className={styles.input}
                            type="date"
                            value={String(formData.date)}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Notas</label>
                        <textarea
                            className={styles.input}
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    {/* Financial fields - only for PURCHASE, SALE, DEATH */}
                    {['PURCHASE', 'SALE', 'DEATH'].includes(formData.actionType) && (
                        <>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Moneda</label>
                                <select
                                    className={styles.select}
                                    value={formData.currency || 'USD'}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USD' | 'ARS' })}
                                >
                                    <option value="USD">Dólares (USD)</option>
                                    <option value="ARS">Pesos (ARS)</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    Precio por unidad ({formData.currency === 'ARS' ? 'ARS' : 'USD'})
                                </label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.pricePerUnit || ''}
                                    onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || null })}
                                    placeholder="0.00"
                                />
                                <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                    Opcional. Dejar vacío = $0 (sin impacto financiero)
                                </small>
                            </div>

                            {formData.actionType === 'DEATH' && (
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>
                                        Valor de rescate - Carne ({formData.currency === 'ARS' ? 'ARS' : 'USD'})
                                    </label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.salvageValue || ''}
                                        onChange={(e) => setFormData({ ...formData, salvageValue: parseFloat(e.target.value) || null })}
                                        placeholder="0.00"
                                    />
                                    <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                        Opcional. Valor recuperado (ej: venta de carne). Reduce la pérdida.
                                    </small>
                                </div>
                            )}

                            {formData.currency === 'ARS' && formData.pricePerUnit && (
                                <div style={{ padding: '0.75rem', backgroundColor: '#1e293b', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                                    <small style={{ color: '#94a3b8' }}>
                                        💱 Se convertirá automáticamente a USD usando la cotización oficial del día
                                    </small>
                                </div>
                            )}
                        </>
                    )}

                    <div className={styles.modalActions} style={{ justifyContent: 'space-between' }}>
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={handleDeleteClick}
                        >
                            Eliminar
                        </button>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                title="¿Eliminar movimiento?"
                message="Esta acción no se puede deshacer. El movimiento se eliminará y se revertirán los cambios en el stock del campo."
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                isProcessing={deleteMutation.isPending}
            />
        </div>,
        document.body
    );
};
