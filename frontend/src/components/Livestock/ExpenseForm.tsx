import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import detailStyles from "@/screens/FieldDetailScreen.module.css";
import { useCreateLivestockExpense } from "@/services/LivestockExpenseService";
import { useMyFields } from "@/services/FieldServices";
import { useExchangeRate } from "@/services/FinancialService";
import { useToken } from "@/services/TokenContext";
import { scanInvoice } from "@/services/InvoiceScanService";

export const ExpenseForm = () => {
    const { mutateAsync: createExpense, isPending } = useCreateLivestockExpense();
    const { data: fields } = useMyFields();
    const { data: exchangeRateData } = useExchangeRate();
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const [isOpen, setIsOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState("");
    const [fieldId, setFieldId] = useState<string>("");
    const [cost, setCost] = useState<string>("");
    const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
    const [note, setNote] = useState<string>("");
    const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
    const [scannedPreview, setScannedPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const processFile = async (file: File) => {
        if (!token) return;
        if (!file.type.startsWith('image/')) {
            toast.error("Solo se permiten imágenes");
            return;
        }

        setIsScanning(true);
        try {
            // Show image preview
            const reader = new FileReader();
            reader.onload = (ev) => setScannedPreview(ev.target?.result as string);
            reader.readAsDataURL(file);

            const result = await scanInvoice(file, token);

            // Auto-fill form fields with scanned data
            if (result.name) setName(result.name);
            if (result.cost) setCost(result.cost.toString());
            if (result.currency) setCurrency(result.currency as 'USD' | 'ARS');
            if (result.date) setDate(result.date);
            if (result.note) setNote(result.note);

            toast.success("✅ Factura escaneada. Revisá los campos y confirmá.");
        } catch (error: any) {
            console.error(error);
            toast.error("Error al escanear: " + (error.message || "Intentá de nuevo"));
        } finally {
            setIsScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleScanInvoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

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
            setScannedPreview(null);
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

                {/* AI Scan Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleScanInvoice}
                        style={{ display: 'none' }}
                    />

                    {/* Scan Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isScanning}
                        style={{
                            background: isScanning
                                ? 'rgba(139, 92, 246, 0.3)'
                                : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isScanning ? 'wait' : 'pointer',
                            transition: 'all 0.3s',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                        }}
                    >
                        {isScanning ? (
                            <>
                                <span style={{
                                    display: 'inline-block',
                                    width: '18px',
                                    height: '18px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                                Escaneando con IA...
                            </>
                        ) : (
                            <>📷 Escanear Factura con IA</>
                        )}
                    </button>

                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !isScanning && fileInputRef.current?.click()}
                        style={{
                            padding: isDragging ? '2rem 1rem' : '1.25rem 1rem',
                            borderRadius: '0.75rem',
                            border: isDragging
                                ? '2px dashed #8b5cf6'
                                : '2px dashed rgba(139, 92, 246, 0.35)',
                            background: isDragging
                                ? 'rgba(139, 92, 246, 0.15)'
                                : 'rgba(139, 92, 246, 0.05)',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                        }}
                    >
                        {isDragging ? (
                            <>
                                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📥</div>
                                <p style={{ color: '#c4b5fd', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>
                                    Soltá la imagen acá
                                </p>
                            </>
                        ) : (
                            <>
                                <p style={{ color: '#a78bfa', margin: 0, fontSize: '0.85rem' }}>
                                    📎 Arrastrá una foto de factura acá o hacé click para seleccionar
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Scanned preview */}
                {scannedPreview && (
                    <div style={{
                        marginBottom: '1rem',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        maxHeight: '150px',
                        position: 'relative'
                    }}>
                        <img
                            src={scannedPreview}
                            alt="Factura escaneada"
                            style={{ width: '100%', objectFit: 'cover', maxHeight: '150px' }}
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setScannedPreview(null);
                                setName("");
                                setCost("");
                                setCurrency('USD');
                                setDate(new Date().toLocaleDateString('en-CA'));
                                setNote("");
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                background: 'rgba(239, 68, 68, 0.85)',
                                border: 'none',
                                color: 'white',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(4px)',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}
                            title="Borrar foto y limpiar campos"
                        >✕</button>
                    </div>
                )}

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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
                            disabled={isPending || isScanning}
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
