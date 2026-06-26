import apiClient from "./client";
import type { Expense, ExpenseSummaryItem } from "../types";

export async function listExpenses(month?: string, category_id?: string): Promise<Expense[]> {
  const { data } = await apiClient.get<Expense[]>("/api/v1/expenses", { params: { month, category_id } });
  return data;
}

export async function createExpense(body: {
  category_id: string;
  amount: number;
  description: string;
  date: string;
  currency?: string;
}): Promise<Expense> {
  const { data } = await apiClient.post<Expense>("/api/v1/expenses", body);
  return data;
}

export async function updateExpense(id: string, body: Partial<Expense>): Promise<Expense> {
  const { data } = await apiClient.put<Expense>(`/api/v1/expenses/${id}`, body);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/expenses/${id}`);
}

export async function getExpenseSummary(month?: string): Promise<ExpenseSummaryItem[]> {
  const { data } = await apiClient.get<ExpenseSummaryItem[]>("/api/v1/expenses/summary", { params: { month } });
  return data;
}
