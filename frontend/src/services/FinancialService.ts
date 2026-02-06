import { useQuery } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config/app-query-client";
import { useToken } from "@/services/TokenContext";
import { z } from "zod";

// Exchange rate response schema
const ExchangeRateResponseSchema = z.object({
    rate: z.number(),
    currency: z.string(),
    baseCurrency: z.string(),
    timestamp: z.string(),
});

type ExchangeRateResponse = z.infer<typeof ExchangeRateResponseSchema>;

/**
 * Hook to fetch current ARS/USD exchange rate
 */
export function useExchangeRate() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["exchange_rate"],
        queryFn: async (): Promise<ExchangeRateResponse> => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/currency/exchange-rate`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching exchange rate");
            }

            const data = await response.json();
            return ExchangeRateResponseSchema.parse(data);
        },
        enabled: !!token,
        // Cache for 1 hour since exchange rate doesn't change frequently
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
    });
}

/**
 * Format currency value with proper symbol and decimals
 */
export function formatCurrency(value: number | null | undefined, currency: 'USD' | 'ARS' = 'USD'): string {
    if (value === null || value === undefined) return '-';

    const symbol = currency === 'USD' ? '$' : 'AR$';
    const formatted = new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

    return `${symbol}${formatted}`;
}

/**
 * Convert ARS to USD using current exchange rate
 */
export function convertARStoUSD(amountARS: number, exchangeRate: number): number {
    return amountARS / exchangeRate;
}
