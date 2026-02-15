import { BASE_API_URL } from "@/config/app-query-client";

export interface InvoiceScanResult {
    name: string | null;
    cost: number | null;
    currency: string | null;
    date: string | null;
    note: string | null;
}

export async function scanInvoice(file: File, token: string): Promise<InvoiceScanResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_API_URL}/api/v1/ai/scan-invoice`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error escaneando factura: ${response.status} ${text}`);
    }

    return await response.json();
}
