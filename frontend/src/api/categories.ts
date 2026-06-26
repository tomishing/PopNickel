import apiClient from "./client";
import type { Category } from "../types";

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/api/v1/categories");
  return data;
}

export async function createCategory(body: Pick<Category, "name" | "icon" | "color">): Promise<Category> {
  const { data } = await apiClient.post<Category>("/api/v1/categories", body);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/categories/${id}`);
}
