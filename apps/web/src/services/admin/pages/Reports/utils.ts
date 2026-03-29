import type { AdminReportRow } from "../../../../queries/admin/types";
import { downloadCsv } from "../../utils/csv";

export const REPORT_STATUS_FILTER_ALL = "all" as const;

export type ReportStatusFilter =
  | typeof REPORT_STATUS_FILTER_ALL
  | AdminReportRow["status"];

export function filterReportRows(
  rows: AdminReportRow[],
  search: string,
  status: ReportStatusFilter
): AdminReportRow[] {
  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (status !== REPORT_STATUS_FILTER_ALL && row.status !== status) return false;
    if (!q) return true;
    return (
      row.name.toLowerCase().includes(q) ||
      row.category.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q)
    );
  });
}

export function exportReportsCsv(rows: AdminReportRow[], filename: string) {
  const headers = ["ID", "Name", "Category", "Generated", "Status"];
  const body = rows.map((r) => [r.id, r.name, r.category, r.generatedAt, r.status]);
  downloadCsv(filename, headers, body);
}
