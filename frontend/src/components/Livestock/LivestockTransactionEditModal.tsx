import React, { useState } from "react";
import { createPortal } from "react-dom";
import { LivestockCategory, CategoryLabels, ActionLabels, LivestockTransactionResponse, LivestockTransactionCreate } from "@/models/Livestock";
import { useUpdateLivestockTransaction, useDeleteLivestockTransaction } from "@/services/LivestockService";
import styles from "./Livestock.module.css";

interface LivestockTransactionEditModalProps {
    transaction: LivestockTransactionResponse;
    onClose: () => void;
}

export const LivestockTransactionEditModal: React.FC<LivestockTransactionEditModalProps> = ({ transaction, onClose }) => {
    const updateMutation = useUpdateLivestockTransaction();
    const deleteMutation = useDeleteLivestockTransaction();

    const [formData, setFormData] = useState<LivestockTransactionCreate>({
        sourceFieldId: transaction.sourceFieldId,
        targetFieldId: transaction.targetFieldId,
        category: transaction.category,
        quantity: transaction.quantity,
        actionType: transaction.actionType,
        date: transaction.date, // This might be a string from API
        notes: transaction.notes || "",
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

    const handleDelete = async () => {
        if (confirm("¿Está seguro que desea eliminar este movimiento? Esto revertirá los cambios en el stock.")) {
            try {
                await deleteMutation.mutateAsync(transaction.id);
                onClose();
            } catch (error) {
                console.error(error);
                alert("Error al eliminar la transacción");
            }
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

                    <div className={styles.modalActions} style={{ justifyContent: 'space-between' }}>
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={handleDelete}
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
        </div>,
        document.body
    );
};
