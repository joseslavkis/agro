import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config/app-query-client";
import { useToken } from "@/services/TokenContext";
import { CreateFieldRequest, FieldSchema } from "@/models/Field";
import { z } from "zod";

export function useMyFields() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["fields"],
        queryFn: async () => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/fields`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching fields");
            }

            const data = await response.json();
            return z.array(FieldSchema).parse(data);
        },
        enabled: !!token,
    });
}

export function useCreateField() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateFieldRequest & { imageFile?: File | null }) => {
            if (!token) throw new Error("Not logged in");

            const formData = new FormData();
            formData.append("field", new Blob([JSON.stringify({
                name: data.name,
                hectares: data.hectares,
                photo: data.photo // Keeping this for fallback if user clears file manually but keeps url? Or just ignore
            })], { type: "application/json" }));

            if (data.imageFile) {
                formData.append("image", data.imageFile);
            }

            const response = await fetch(`${BASE_API_URL}/api/v1/fields`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error creating field: ${response.status} ${text}`);
            }

            return FieldSchema.parse(await response.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fields"] });
        },
    });
}

export function useDeleteField() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (fieldId: number) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/fields/${fieldId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error deleting field: ${response.status} ${text}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fields"] });
        },
    });
}
