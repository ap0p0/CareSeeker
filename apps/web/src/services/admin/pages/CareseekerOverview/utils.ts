import type { AdminCareseekerRow } from "../../../../queries/admin/types";
import { downloadCsv } from "../../utils/csv";

export const STATUS_FILTER_ALL = "all" as const;

export type CareseekerStatusFilter =
  | typeof STATUS_FILTER_ALL
  | AdminCareseekerRow["status"];

export function filterCareseekerRows(
  rows: AdminCareseekerRow[],
  search: string,
  status: CareseekerStatusFilter
): AdminCareseekerRow[] {
  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (status !== STATUS_FILTER_ALL && row.status !== status) return false;
    if (!q) return true;
    return (
      row.name.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      row.city.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q)
    );
  });
}

export function exportCareseekersCsv(rows: AdminCareseekerRow[], filename: string) {
  const headers = ["ID", "Name", "Email", "Status", "Joined", "City"];
  const body = rows.map((r) => [
    r.id,
    r.name,
    r.email,
    r.status,
    r.joinedAt,
    r.city,
  ]);
  downloadCsv(filename, headers, body);
}
