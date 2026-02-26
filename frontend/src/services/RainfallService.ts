import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config/app-query-client";
import { useToken } from "@/services/TokenContext";
import { RainfallRecordSchema } from "@/models/RainfallRecord";
import { z } from "zod";

export function useRainfallRecords(fieldId: number) {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["rainfallRecords", fieldId],
        queryFn: async () => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/fields/${fieldId}/rainfall`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching rainfall records");
            }

            const data = await response.json();
            return z.array(RainfallRecordSchema).parse(data);
        },
        enabled: !!token,
    });
}

export function useCreateRainfall(fieldId: number) {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { date: string; amountMm: number }) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/fields/${fieldId}/rainfall`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error creating rainfall record: ${response.status} ${text}`);
            }

            return RainfallRecordSchema.parse(await response.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rainfallRecords", fieldId] });
        },
    });
}

export function useDeleteRainfall(fieldId: number) {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (recordId: number) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/fields/${fieldId}/rainfall/${recordId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error deleting rainfall record: ${response.status} ${text}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rainfallRecords", fieldId] });
        },
    });
}
