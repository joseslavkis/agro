import { useState } from "react";
import { useRainfallRecords, useCreateRainfall, useDeleteRainfall } from "@/services/RainfallService";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import styles from "./RainfallFormScreen.module.css";
import { Link } from "wouter";

interface RainfallFormScreenProps {
    id: number;
}

export const RainfallFormScreen = ({ id }: RainfallFormScreenProps) => {
    const { data: records, isLoading } = useRainfallRecords(id);
    const { mutateAsync: createRainfall, isPending: isCreating } = useCreateRainfall(id);
    const { mutateAsync: deleteRainfall } = useDeleteRainfall(id);

    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const [amountMm, setAmountMm] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const amount = parseFloat(amountMm);
        if (!date || isNaN(amount) || amount <= 0) {
            setError("Completá la fecha y una cantidad válida en mm.");
            return;
        }

        try {
            await createRainfall({ date, amountMm: amount });
            setAmountMm("");
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || "Error al guardar la lluvia.");
        }
    };

    const handleDelete = async (recordId: number) => {
        try {
            await deleteRainfall(recordId);
        } catch (err: any) {
            setError(err.message || "Error al eliminar el registro.");
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + "T12:00:00");
        return new Intl.DateTimeFormat("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(d);
    };

    return (
        <CommonLayout showVideo={false} contentStyle={{ maxWidth: "100%" }}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <Link href={`/fields/${id}/weather`}>
                        <a className={styles.backButton} style={{ marginBottom: "1rem" }}>
                            ← Volver al Clima
                        </a>
                    </Link>
                    <h1 className={styles.title}>🌧️ Cargar Lluvia</h1>
                </header>

                {/* Form */}
                <div className={styles.formCard}>
                    <h3 className={styles.formTitle}>Registrar nueva lluvia</h3>

                    {success && (
                        <div className={styles.successMessage}>
                            ✅ Lluvia registrada correctamente
                        </div>
                    )}
                    {error && (
                        <div className={styles.errorMessage}>❌ {error}</div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Fecha</label>
                            <input
                                className={styles.input}
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Cantidad (mm)</label>
                            <input
                                className={styles.input}
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="Ej. 25.5"
                                value={amountMm}
                                onChange={(e) => setAmountMm(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isCreating}
                        >
                            {isCreating ? "Guardando..." : "Guardar"}
                        </button>
                    </form>
                </div>

                {/* Records List */}
                <div className={styles.listCard}>
                    <h3 className={styles.listTitle}>Registros cargados</h3>

                    {isLoading ? (
                        <div className={styles.emptyState}>Cargando registros...</div>
                    ) : records && records.length > 0 ? (
                        records.map((record) => (
                            <div key={record.id} className={styles.recordItem}>
                                <span className={styles.recordDate}>
                                    📅 {formatDate(record.date)}
                                </span>
                                <span className={styles.recordAmount}>
                                    💧 {record.amountMm} mm
                                </span>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDelete(record.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            No hay registros de lluvias aún. ¡Cargá el primero!
                        </div>
                    )}
                </div>
            </div>
        </CommonLayout>
    );
};
