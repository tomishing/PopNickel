import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as expensesApi from "../api/expenses";

export function useExpenses(month?: string, categoryId?: string) {
  return useQuery({
    queryKey: ["expenses", month, categoryId],
    queryFn: () => expensesApi.listExpenses(month, categoryId),
  });
}

export function useExpenseSummary(month?: string) {
  return useQuery({
    queryKey: ["expenses", "summary", month],
    queryFn: () => expensesApi.getExpenseSummary(month),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.createExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.deleteExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}
