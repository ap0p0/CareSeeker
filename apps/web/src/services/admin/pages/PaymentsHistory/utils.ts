import type { AdminPaymentRow } from "../../../../queries/admin/types";
import { downloadCsv } from "../../utils/csv";

export const PAYMENT_STATUS_FILTER_ALL = "all" as const;

export type PaymentStatusFilter =
  | typeof PAYMENT_STATUS_FILTER_ALL
  | AdminPaymentRow["status"];

export function formatPaymentAmount(row: AdminPaymentRow): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: row.currency,
  }).format(row.amountCents / 100);
}

export function filterPaymentRows(
  rows: AdminPaymentRow[],
  search: string,
  status: PaymentStatusFilter
): AdminPaymentRow[] {
  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (status !== PAYMENT_STATUS_FILTER_ALL && row.status !== status) return false;
    if (!q) return true;
    return (
      row.id.toLowerCase().includes(q) ||
      row.payer.toLowerCase().includes(q) ||
      row.payee.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    );
  });
}

export function exportPaymentsCsv(rows: AdminPaymentRow[], filename: string) {
  const headers = ["ID", "Paid at", "Amount (cents)", "Currency", "Payer", "Payee", "Status"];
  const body = rows.map((r) => [
    r.id,
    r.paidAt,
    String(r.amountCents),
    r.currency,
    r.payer,
    r.payee,
    r.status,
  ]);
  downloadCsv(filename, headers, body);
}
