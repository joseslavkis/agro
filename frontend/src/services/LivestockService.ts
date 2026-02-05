import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config/app-query-client";
import { useToken } from "@/services/TokenContext";
import { LivestockTransactionCreate, LivestockTransactionResponseSchema } from "@/models/Livestock";
import { z } from "zod";

export function useLivestockTransactions() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["livestock_transactions"],
        queryFn: async () => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/livestock/transactions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching transactions");
            }

            const data = await response.json();
            return z.array(LivestockTransactionResponseSchema).parse(data);
        },
        enabled: !!token,
    });
}

export function useCreateLivestockTransaction() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: LivestockTransactionCreate) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/livestock/transaction`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error creating transaction: ${response.status} ${text}`);
            }

            return LivestockTransactionResponseSchema.parse(await response.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fields"] }); // To update stock in field views
            queryClient.invalidateQueries({ queryKey: ["livestock_transactions"] });
        },
    });
}

export function useUpdateLivestockTransaction() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number, data: LivestockTransactionCreate }) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/livestock/transaction/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error updating transaction: ${response.status} ${text}`);
            }

            return LivestockTransactionResponseSchema.parse(await response.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fields"] });
            queryClient.invalidateQueries({ queryKey: ["livestock_transactions"] });
        },
    });
}

export function useDeleteLivestockTransaction() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/livestock/transaction/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error deleting transaction: ${response.status} ${text}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fields"] });
            queryClient.invalidateQueries({ queryKey: ["livestock_transactions"] });
        },
    });
}
