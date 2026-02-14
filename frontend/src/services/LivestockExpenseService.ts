import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config/app-query-client";
import { useToken } from "@/services/TokenContext";
import { LivestockExpenseCreate, LivestockExpenseResponseSchema } from "@/models/LivestockExpense";
import { z } from "zod";

export function useLivestockExpenses() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["livestock_expenses"],
        queryFn: async () => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/livestock/expenses`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching expenses");
            }

            const data = await response.json();
            return z.array(LivestockExpenseResponseSchema).parse(data);
        },
        enabled: !!token,
    });
}

export function useCreateLivestockExpense() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: LivestockExpenseCreate) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/livestock/expense`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error creating expense: ${response.status} ${text}`);
            }

            return LivestockExpenseResponseSchema.parse(await response.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["livestock_expenses"] });
            queryClient.invalidateQueries({ queryKey: ["agenda"] });
        },
    });
}

export function useUpdateLivestockExpense() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: LivestockExpenseCreate }) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/livestock/expense/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error updating expense: ${response.status} ${text}`);
            }

            return LivestockExpenseResponseSchema.parse(await response.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["livestock_expenses"] });
            queryClient.invalidateQueries({ queryKey: ["agenda"] });
        },
    });
}

export function useDeleteLivestockExpense() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/livestock/expense/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error deleting expense: ${response.status} ${text}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["livestock_expenses"] });
            queryClient.invalidateQueries({ queryKey: ["agenda"] });
        },
    });
}
