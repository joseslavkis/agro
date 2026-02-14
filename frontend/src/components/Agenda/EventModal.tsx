import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { EVENT_LABELS, useCreateEvent, useUpdateEvent, useDeleteEvent, AgendaCreateRequest } from "@/services/AgendaService";
import { useMyFields } from "@/services/FieldServices";

interface EventModalProps {
    event?: any; // If present, edit mode
    initialDate?: Date;
    onClose: () => void;
}

const LIVESTOCK_EVENT_TYPES = ['PURCHASE', 'SALE', 'LIVESTOCK_BIRTH', 'LIVESTOCK_MOVE', 'HEALTH', 'LIVESTOCK_EXPENSE'];

import { ConfirmationModal } from "@/components/Common/ConfirmationModal";

export default function EventModal({ event, initialDate, onClose }: EventModalProps) {
    const { data: fields } = useMyFields();
    const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
    const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent();
    const { mutateAsync: deleteEvent, isPending: isDeleting } = useDeleteEvent();

    const isEdit = !!event;
    const isLivestockEvent = isEdit && LIVESTOCK_EVENT_TYPES.includes(event?.eventType);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

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
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            const formatLocal = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };
            setFormData({
                title: event.title,
                description: event.description || "",
                startDate: formatLocal(start),
                endDate: formatLocal(end),
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

        // Validate that start date is before end date
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (startDate >= endDate) {
            toast.error("La fecha de inicio debe ser anterior a la fecha de fin");
            return;
        }

        try {
            const payload: AgendaCreateRequest = {
                title: formData.title,
                description: formData.description || undefined,
                startDate: formData.startDate,
                endDate: formData.endDate,
                eventType: formData.eventType as any,
                fieldId: formData.fieldId || undefined,
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
                    {isLivestockEvent ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ color: '#f8fafc', marginBottom: '1rem', fontSize: '1.5rem' }}>
                                    {formData.title}
                                </h2>
                                <div style={{
                                    backgroundColor: '#0f172a',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #334155',
                                    marginBottom: '1rem'
                                }}>
                                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                        {event?.eventType === 'LIVESTOCK_EXPENSE' ? '💸' : '🐄'}{' '}
                                        <strong style={{ color: '#fbbf24' }}>
                                            {event?.eventType === 'LIVESTOCK_EXPENSE' ? 'Gasto de Hacienda' : 'Evento de Ganadería'}
                                        </strong>
                                    </p>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                        {event?.eventType === 'LIVESTOCK_EXPENSE'
                                            ? 'Este evento está vinculado a un gasto de hacienda. Para editarlo, debe hacerlo desde el Historial de Gastos.'
                                            : 'Este evento está vinculado a un movimiento de ganadería. Para editarlo, debe hacerlo desde el Historial de Movimientos.'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#64748b', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Tipo</label>
                                    <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
                                        {EVENT_LABELS[formData.eventType] || formData.eventType}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#64748b', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Inicio</label>
                                        <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                                            {new Date(formData.startDate).toLocaleString('es-AR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#64748b', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Fin</label>
                                        <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                                            {new Date(formData.endDate).toLocaleString('es-AR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {formData.fieldId && (
                                    <div>
                                        <label style={{ display: 'block', color: '#64748b', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Campo</label>
                                        <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
                                            {fields?.find(f => f.id === formData.fieldId)?.name || 'Desconocido'}
                                        </div>
                                    </div>
                                )}

                                {formData.description && (
                                    <div>
                                        <label style={{ display: 'block', color: '#64748b', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Descripción</label>
                                        <div style={{
                                            color: '#cbd5e1',
                                            fontSize: '0.9rem',
                                            whiteSpace: 'pre-wrap',
                                            backgroundColor: '#0f172a',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #334155'
                                        }}>
                                            {formData.description}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                                    Cerrar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        if (event?.eventType === 'LIVESTOCK_EXPENSE') {
                                            toast.info("Por favor, busque este gasto en el Historial de Gastos en la sección de Ganadería General");
                                        } else {
                                            toast.info("Por favor, busque este movimiento en el Historial de Movimientos dentro del campo correspondiente");
                                        }
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.5rem',
                                        backgroundColor: '#3b82f6',
                                        border: 'none',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Ir al Historial
                                </button>
                            </div>
                        </>
                    ) : (
                        /* NORMAL EDIT FORM FOR NON-LIVESTOCK EVENTS */
                        <>
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
                                        {Object.entries(EVENT_LABELS)
                                            .filter(([key]) => {
                                                // Exclude livestock event types - they should only be created from "Registrar Movimiento"
                                                const livestockTypes = ['PURCHASE', 'SALE', 'LIVESTOCK_BIRTH', 'LIVESTOCK_MOVE', 'HEALTH'];
                                                return !livestockTypes.includes(key);
                                            })
                                            .map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))
                                        }
                                    </select>
                                    <small style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                                        💡 Los movimientos de ganadería se registran desde "Registrar Movimiento"
                                    </small>
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
                        </>
                    )}
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
