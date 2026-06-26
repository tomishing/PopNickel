import apiClient from "./client";
import type { User } from "../types";

export async function register(email: string, password: string, full_name: string): Promise<User> {
  const { data } = await apiClient.post<User>("/api/v1/auth/register", { email, password, full_name });
  return data;
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  const { data } = await apiClient.post<{ access_token: string }>("/api/v1/auth/login", { email, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/api/v1/auth/me");
  return data;
}
