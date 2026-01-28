import { useMutation } from "@tanstack/react-query";

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
    throw new Error("Correo electrónico o contraseña incorrectos");
  } else {
    throw new Error(`Falló con estado ${response.status}: ${await response.text()}`);
  }
}
