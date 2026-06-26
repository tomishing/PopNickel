import apiClient from "./client";
import type { ReceiptScanOut } from "../types";

export async function scanReceipt(file: File): Promise<ReceiptScanOut> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<ReceiptScanOut>("/api/v1/receipts/scan", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function confirmReceipt(
  receiptId: string,
  items: { name: string; amount: number; category_id: string }[]
): Promise<void> {
  await apiClient.post(`/api/v1/receipts/${receiptId}/confirm`, { items });
}
