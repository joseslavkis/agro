import { useRef, useEffect, useMemo } from "react";
import { useRainfallRecords } from "@/services/RainfallService";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import styles from "./RainfallChartScreen.module.css";
import { Link } from "wouter";

interface RainfallChartScreenProps {
    id: number;
}

interface MonthlyData {
    key: string;       // "2025-03"
    label: string;     // "Mar 2025"
    totalMm: number;
    count: number;
}

export const RainfallChartScreen = ({ id }: RainfallChartScreenProps) => {
    const { data: records, isLoading } = useRainfallRecords(id);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Build last 12 months keys
    const last12Months = useMemo(() => {
        const months: { key: string; label: string }[] = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const label = new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" }).format(d);
            months.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1) });
        }
        return months;
    }, []);

    // Aggregate records into monthly buckets for last 12 months
    const monthlyData = useMemo((): MonthlyData[] => {
        const map = new Map<string, { totalMm: number; count: number }>();
        last12Months.forEach((m) => map.set(m.key, { totalMm: 0, count: 0 }));

        if (records) {
            records.forEach((r) => {
                const monthKey = r.date.substring(0, 7); // "2025-03"
                const entry = map.get(monthKey);
                if (entry) {
                    entry.totalMm += r.amountMm;
                    entry.count += 1;
                }
            });
        }

        return last12Months.map((m) => {
            const entry = map.get(m.key)!;
            return {
                key: m.key,
                label: m.label,
                totalMm: Math.round(entry.totalMm * 10) / 10,
                count: entry.count,
            };
        });
    }, [records, last12Months]);

    // Filter records to last 12 months for stats
    const recordsInRange = useMemo(() => {
        if (!records) return [];
        const firstKey = last12Months[0].key;
        return records.filter((r) => r.date.substring(0, 7) >= firstKey);
    }, [records, last12Months]);

    // Summary stats scoped to last 12 months
    const totalMm = useMemo(
        () => Math.round(recordsInRange.reduce((sum, r) => sum + r.amountMm, 0) * 10) / 10,
        [recordsInRange]
    );
    const avgMm = useMemo(
        () => (recordsInRange.length > 0 ? Math.round((totalMm / recordsInRange.length) * 10) / 10 : 0),
        [recordsInRange, totalMm]
    );
    const maxRecord = useMemo(
        () =>
            recordsInRange.length > 0
                ? recordsInRange.reduce((max, r) => (r.amountMm > max.amountMm ? r : max))
                : null,
        [recordsInRange]
    );

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const padding = { top: 40, right: 30, bottom: 80, left: 65 };
        const parentWidth = canvas.parentElement?.clientWidth || 700;
        const chartWidth = Math.max(parentWidth, 600);
        const chartHeight = 400;

        canvas.width = chartWidth * dpr;
        canvas.height = chartHeight * dpr;
        canvas.style.width = `${chartWidth}px`;
        canvas.style.height = `${chartHeight}px`;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, chartWidth, chartHeight);

        const drawWidth = chartWidth - padding.left - padding.right;
        const drawHeight = chartHeight - padding.top - padding.bottom;

        const maxVal = Math.max(...monthlyData.map((m) => m.totalMm), 1);
        const barSpacing = drawWidth / 12;
        const barWidth = Math.min(barSpacing - 12, 45);

        // Grid lines
        const gridLines = 5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.fillStyle = "#64748b";
        ctx.font = "12px Inter, sans-serif";
        ctx.textAlign = "right";

        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + drawHeight - (i / gridLines) * drawHeight;
            const val = ((i / gridLines) * maxVal).toFixed(0);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(chartWidth - padding.right, y);
            ctx.stroke();
            ctx.fillText(`${val} mm`, padding.left - 8, y + 4);
        }

        // Y axis label
        ctx.save();
        ctx.translate(15, padding.top + drawHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.fillText("Milímetros", 0, 0);
        ctx.restore();

        // Bars
        monthlyData.forEach((month, i) => {
            const x = padding.left + i * barSpacing + (barSpacing - barWidth) / 2;

            if (month.totalMm === 0) {
                // Draw a subtle placeholder line
                ctx.strokeStyle = "rgba(96, 165, 250, 0.2)";
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(x, padding.top + drawHeight);
                ctx.lineTo(x + barWidth, padding.top + drawHeight);
                ctx.stroke();
                ctx.setLineDash([]);

                // "0" label
                ctx.fillStyle = "#475569";
                ctx.font = "bold 11px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("0", x + barWidth / 2, padding.top + drawHeight - 6);
            } else {
                const barHeight = (month.totalMm / maxVal) * drawHeight;
                const y = padding.top + drawHeight - barHeight;

                // Gradient bar
                const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
                gradient.addColorStop(0, "#60a5fa");
                gradient.addColorStop(1, "#1d4ed8");
                ctx.fillStyle = gradient;

                // Rounded top
                const radius = Math.min(barWidth / 2, 6);
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + barWidth - radius, y);
                ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
                ctx.lineTo(x + barWidth, y + barHeight);
                ctx.lineTo(x, y + barHeight);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();

                // Value label on top
                ctx.fillStyle = "#e2e8f0";
                ctx.font = "bold 11px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`${month.totalMm}`, x + barWidth / 2, y - 6);
            }

            // Month label (rotated)
            ctx.fillStyle = "#94a3b8";
            ctx.font = "11px Inter, sans-serif";
            ctx.save();
            ctx.translate(x + barWidth / 2, padding.top + drawHeight + 15);
            ctx.rotate(-Math.PI / 5);
            ctx.textAlign = "right";
            ctx.fillText(month.label, 0, 0);
            ctx.restore();
        });
    }, [monthlyData]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + "T12:00:00");
        return new Intl.DateTimeFormat("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(d);
    };

    const hasAnyData = recordsInRange.length > 0;

    return (
        <CommonLayout showVideo={false} contentStyle={{ maxWidth: "100%" }}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <Link href={`/fields/${id}/weather`}>
                        <a className={styles.backButton} style={{ marginBottom: "1rem" }}>
                            ← Volver al Clima
                        </a>
                    </Link>
                    <h1 className={styles.title}>📊 Historial de Lluvias</h1>
                    <p style={{ color: '#94a3b8', margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
                        Últimos 12 meses
                    </p>
                </header>

                {isLoading ? (
                    <div className={styles.emptyState}>Cargando datos...</div>
                ) : (
                    <>
                        {/* Summary Stats */}
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryValue}>
                                    {totalMm.toFixed(1)} mm
                                </div>
                                <div className={styles.summaryLabel}>Total acumulado</div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryValue}>
                                    {avgMm.toFixed(1)} mm
                                </div>
                                <div className={styles.summaryLabel}>Promedio por registro</div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryValue}>
                                    {recordsInRange.length}
                                </div>
                                <div className={styles.summaryLabel}>Total registros</div>
                            </div>
                            {maxRecord && (
                                <div className={styles.summaryItem}>
                                    <div className={styles.summaryValue}>
                                        {maxRecord.amountMm} mm
                                    </div>
                                    <div className={styles.summaryLabel}>
                                        Máxima ({formatDate(maxRecord.date)})
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chart */}
                        <div className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>
                                Lluvias mensuales — Últimos 12 meses
                            </h3>
                            <div className={styles.chartContainer}>
                                <canvas ref={canvasRef} />
                            </div>
                        </div>

                        {!hasAnyData && (
                            <div className={styles.emptyState}>
                                <p>No hay registros de lluvias en los últimos 12 meses.</p>
                                <Link href={`/fields/${id}/rainfall/new`}>
                                    <a>🌧️ Cargar la primera lluvia →</a>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </CommonLayout>
    );
};
