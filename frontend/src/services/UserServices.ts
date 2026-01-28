import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { LoginRequest, LoginResponseSchema } from "@/models/Login";
import { useToken } from "@/services/TokenContext";

export function useLogin() {
  const [, setToken] = useToken();

  return useMutation({
    mutationFn: async (req: LoginRequest) => {
      const tokenData = await auth("/api/v1/auth/token", req);
      setToken({ state: "LOGGED_IN", ...tokenData });
    },
  });
}

import { SignupRequest } from "@/models/Signup";

export function useSignup() {
  const [, setToken] = useToken();

  return useMutation({
    mutationFn: async (req: SignupRequest) => {
      const tokenData = await auth("/api/v1/auth/signup", req);
      setToken({ state: "LOGGED_IN", ...tokenData });
    },
  });
}

async function auth(endpoint: string, data: LoginRequest) {
  const response = await fetch(BASE_API_URL + endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return LoginResponseSchema.parse(await response.json());
  } else if (response.status === 409) {
    throw new Error("El correo electrónico ya está registrado");
  } else if (response.status === 401 || response.status === 403) {
    // Try to get more info if possible
    try {
      const errJson = await response.json();
      // If the backend sends a specific message
      if (errJson && errJson.message) {
        if (errJson.message.includes("Invalid credentials") || response.status === 401) {
          throw new Error("Credenciales inválidas. Verifica tu correo y contraseña.");
        }
        throw new Error(errJson.message);
      }
    } catch (e) {
      // failed to parse json, fall back to default
    }
    throw new Error("Correo electrónico o contraseña incorrectos");
  } else {
    let msg = `Falló con estado ${response.status}`;
    try {
      const errText = await response.text();
      // If it's a 500 and contains "Invalid credentials" (which is weird for 500 but user reported it)
      // Or if the user said "org.springframework.web.server.ResponseStatusException 401 UNAUTHORIZED" happened as 500
      if (errText.includes("Invalid credentials") || errText.includes("UNAUTHORIZED")) {
        throw new Error("Credenciales inválidas.");
      }
      msg += `: ${errText}`;
    } catch (e) { }
    throw new Error(msg);
  }
}

import { UserProfileSchema } from "@/models/User";
import { PartnerRequestSchema } from "@/models/PartnerRequest";
import { z } from "zod";

export function usePartners() {
  const [tokenState] = useToken();
  const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

  return useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      if (!token) throw new Error("Not logged in");
      const response = await fetch(`${BASE_API_URL}/api/v1/partners/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching partners");
      }

      const data = await response.json();
      return z.array(UserProfileSchema).parse(data);
    },
    enabled: !!token,
  });
}

export function usePendingInvitations() {
  const [tokenState] = useToken();
  const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

  return useQuery({
    queryKey: ["pending-invitations"],
    queryFn: async () => {
      if (!token) throw new Error("Not logged in");
      const response = await fetch(`${BASE_API_URL}/api/v1/partners/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching pending invitations");
      }

      const data = await response.json();
      return z.array(PartnerRequestSchema).parse(data);
    },
    enabled: !!token,
    refetchInterval: 10000, // Poll every 10 seconds for new invites
  });
}

export function useSendInvitation() {
  const [tokenState] = useToken();
  const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

  return useMutation({
    mutationFn: async (username: string) => {
      if (!token) throw new Error("Not logged in");
      const response = await fetch(`${BASE_API_URL}/api/v1/partners/invite/${username}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error sending invitation. User might not exist or already invited.");
      }
    },
  });
}

export function useAcceptInvitation() {
  const [tokenState] = useToken();
  const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: number) => {
      if (!token) throw new Error("Not logged in");
      const response = await fetch(`${BASE_API_URL}/api/v1/partners/accept/${requestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error accepting invitation");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
    },
  });
}

export function useDeclineInvitation() {
  const [tokenState] = useToken();
  const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: number) => {
      if (!token) throw new Error("Not logged in");
      const response = await fetch(`${BASE_API_URL}/api/v1/partners/decline/${requestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error declining invitation");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
    },
  });
}

export function useSearchUsers(query: string) {
  const [tokenState] = useToken();
  const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

  return useQuery({
    queryKey: ["search-users", query],
    queryFn: async () => {
      if (!token) throw new Error("Not logged in");
      if (!query || query.length < 2) return [];

      const response = await fetch(`${BASE_API_URL}/api/v1/users/search?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error searching users");
      }

      const data = await response.json();
      return z.array(UserProfileSchema).parse(data);
    },
    enabled: !!token && query.length >= 2,
  });
}
