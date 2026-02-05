import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { EVENT_LABELS, useCreateEvent, useUpdateEvent, useDeleteEvent, AgendaCreateRequest } from "@/services/AgendaService";
import { useMyFields } from "@/services/FieldServices";

interface EventModalProps {
    event?: any; // If present, edit mode
    initialDate?: Date;
    onClose: () => void;
}

import { ConfirmationModal } from "@/components/Common/ConfirmationModal";

export const EventModal = ({ event, initialDate, onClose }: EventModalProps) => {
    const isEdit = !!event;
    const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
    const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent();
    const { mutateAsync: deleteEvent, isPending: isDeleting } = useDeleteEvent();
    const { data: fields } = useMyFields();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    const [formData, setFormData] = useState<AgendaCreateRequest>({
        title: "",
        description: "",
        startDate: initialDate ? initialDate.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        endDate: initialDate ? new Date(initialDate.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        eventType: "GENERAL",
        fieldId: null
    });

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description || "",
                startDate: new Date(event.startDate).toISOString().slice(0, 16),
                endDate: new Date(event.endDate).toISOString().slice(0, 16),
                eventType: event.eventType,
                fieldId: event.fieldId || null
            });
        }
    }, [event]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Append seconds to dates for backend LocalDateTime compatibility
            const payload = {
                ...formData,
                startDate: formData.startDate.length === 16 ? `${formData.startDate}:00` : formData.startDate,
                endDate: formData.endDate.length === 16 ? `${formData.endDate}:00` : formData.endDate,
            };

            if (isEdit) {
                await updateEvent({ id: event.id, data: payload });
            } else {
                await createEvent(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al guardar el evento");
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteEvent(event.id);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al eliminar");
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    return createPortal(
        <>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <div style={{
                    backgroundColor: '#1e293b', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px',
                    border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                }}>
                    <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                        {isEdit ? "Editar Evento" : "Nuevo Evento"}
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Título</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }}
                                placeholder="Ej. Vacunación Aftosa"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tipo de Evento</label>
                            <select
                                value={formData.eventType}
                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }}
                            >
                                {Object.entries(EVENT_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Inicio</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Fin</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Campo (Opcional)</label>
                            <select
                                value={formData.fieldId || ""}
                                onChange={(e) => setFormData({ ...formData, fieldId: e.target.value ? Number(e.target.value) : null })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }}
                            >
                                <option value="">-- Ninguno / General --</option>
                                {fields?.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Descripción</label>
                            <textarea
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', minHeight: '80px' }}
                                placeholder="Notas adicionales..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {isEdit && (
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #ef4444',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Eliminar
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #475569',
                                    color: '#cbd5e1',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    transition: 'all 0.2s'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating || isUpdating}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: '#3b82f6',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    opacity: (isCreating || isUpdating) ? 0.7 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isCreating || isUpdating ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                title="¿Eliminar evento?"
                message="Esta acción no se puede deshacer. El evento se eliminará permanentemente de la agenda."
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                isProcessing={isDeleting}
            />
        </>,
        document.body
    );
};
