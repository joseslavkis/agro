import { createPortal } from "react-dom";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isProcessing?: boolean;
}

export const ConfirmationModal = ({
    isOpen,
    title,
    message,
    confirmText = "Eliminar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    isProcessing = false
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: "blur(2px)"
        }} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
            <div style={{
                backgroundColor: '#1e293b',
                padding: '2rem',
                borderRadius: '1rem',
                width: '90%',
                maxWidth: '400px',
                border: '1px solid #334155',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                animation: "fadeIn 0.2s ease-out"
            }}>
                <h3 style={{ color: '#f8fafc', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
                    {title}
                </h3>

                <p style={{ color: '#cbd5e1', marginBottom: '2rem', lineHeight: '1.5' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #475569',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            backgroundColor: '#ef4444',
                            border: 'none',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: isProcessing ? 0.7 : 1,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isProcessing ? (
                            <>
                                <span style={{
                                    width: '12px', height: '12px',
                                    border: '2px solid white', borderTopColor: 'transparent',
                                    borderRadius: '50%', display: 'inline-block',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Procesando...
                            </>
                        ) : confirmText}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>,
        document.body
    );
};
