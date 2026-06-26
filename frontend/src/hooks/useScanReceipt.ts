import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as receiptsApi from "../api/receipts";

export function useScanReceipt() {
  return useMutation({
    mutationFn: receiptsApi.scanReceipt,
  });
}

export function useConfirmReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ receiptId, items }: { receiptId: string; items: { name: string; amount: number; category_id: string }[] }) =>
      receiptsApi.confirmReceipt(receiptId, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}
