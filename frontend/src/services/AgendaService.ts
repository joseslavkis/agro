import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config/app-query-client";
import { useToken } from "@/services/TokenContext";
import { z } from "zod";

export const AgendaEventSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().nullable().optional(),
    startDate: z.string(),
    endDate: z.string(),
    eventType: z.enum(["VACCINATION", "SOWING", "HARVEST", "GENERAL", "TASK"]),
    fieldId: z.number().nullable().optional(),
});

export type AgendaEvent = z.infer<typeof AgendaEventSchema>;

export const AgendaCreateSchema = z.object({
    title: z.string().min(1, "El título es requerido"),
    description: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    eventType: z.enum(["VACCINATION", "SOWING", "HARVEST", "GENERAL", "TASK"]),
    fieldId: z.number().optional().nullable(),
});

export type AgendaCreateRequest = z.infer<typeof AgendaCreateSchema>;

// Helpers for color coding
export const EVENT_COLORS: Record<string, string> = {
    VACCINATION: "#ef4444", // Red
    SOWING: "#10b981",      // Green
    HARVEST: "#f59e0b",     // Amber
    GENERAL: "#3b82f6",     // Blue
    TASK: "#8b5cf6"         // Purple
};

export const EVENT_LABELS: Record<string, string> = {
    VACCINATION: "Vacunación",
    SOWING: "Siembra",
    HARVEST: "Cosecha",
    GENERAL: "General",
    TASK: "Tarea"
};

export function useAgendaEvents() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["agenda"],
        queryFn: async () => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/agenda`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) throw new Error("Error fetching agenda");

            const data = await response.json();
            console.log("RAW AGENDA DATA:", data);

            try {
                const parsed = z.array(AgendaEventSchema).parse(data);
                console.log("PARSED AGENDA DATA:", parsed);
                return parsed.map(event => ({
                    ...event,
                    // Convert ISO strings to Date objects for the calendar lib
                    start: new Date(event.startDate),
                    end: new Date(event.endDate),
                    // Add color property for styling
                    color: EVENT_COLORS[event.eventType] || "#64748b"
                }));
            } catch (error) {
                console.error("ZOD PARSING ERROR:", error);
                throw error;
            }
        },
        enabled: !!token,
    });
}

export function useCreateEvent() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AgendaCreateRequest) => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/agenda`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error creating event: ${text}`);
            }
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agenda"] });
        },
    });
}

export function useUpdateEvent() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: AgendaCreateRequest }) => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/agenda/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Error updating event");
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agenda"] });
        },
    });
}

export function useDeleteEvent() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/agenda/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Error deleting event");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agenda"] });
        },
    });
}
