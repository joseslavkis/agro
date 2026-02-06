import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useMyFields } from "@/services/FieldServices";
import styles from "./FieldDetailScreen.module.css";
import { Link } from "wouter";
import { LivestockSummary } from "@/components/Livestock/LivestockSummary";
import { LivestockActionForm } from "@/components/Livestock/LivestockActionForm";
import { LivestockHistory } from "@/components/Livestock/LivestockHistory";
import { FinancialSummary } from "@/components/Livestock/FinancialSummary";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const LivestockScreen = () => {
    const { data: fields, isLoading } = useMyFields();

    if (isLoading) {
        return (
            <CommonLayout>
                <div className={styles.container}>
                    <h2 style={{ color: "white" }}>Cargando información ganadera...</h2>
                </div>
            </CommonLayout>
        );
    }

    // Filter livestock fields
    const livestockFields = fields?.filter(f => f.hasLivestock) || [];

    if (livestockFields.length === 0) {
        return (
            <CommonLayout>
                <div className={styles.container}>
                    <h2 style={{ color: "white" }}>No tienes campos ganaderos registrados</h2>
                    <Link href="/">
                        <a className={styles.backButton}>Ir a Mis Campos</a>
                    </Link>
                </div>
            </CommonLayout>
        );
    }

    return (
        <CommonLayout contentStyle={{ maxWidth: '100%' }}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <Link href="/">
                            <a className={styles.backButton} style={{ display: 'inline-flex', marginBottom: '1rem' }}>← Volver</a>
                        </Link>
                        <h1 className={styles.title}>Ganadería General</h1>
                        <p style={{ color: '#93c5fd', marginTop: '0.5rem' }}>Gestión de Hacienda y Movimientos</p>
                    </div>
                </header>

                {/* Main Layout Grid */}
                <div style={{ display: 'grid', gap: '2rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* 1. Summary Card */}
                        <div style={{ height: '100%' }}>
                            <LivestockSummary fields={livestockFields} />
                        </div>

                        {/* 2. Financial Summary */}
                        <div style={{ height: '100%' }}>
                            <FinancialSummary />
                        </div>

                        {/* 3. Action Form */}
                        <div style={{ height: '100%' }}>
                            <LivestockActionForm fields={livestockFields} />
                        </div>
                    </div>

                    {/* 3. History List - Full Width */}
                    <ErrorBoundary>
                        <LivestockHistory />
                    </ErrorBoundary>
                </div>
            </div>
        </CommonLayout>
    );
};
