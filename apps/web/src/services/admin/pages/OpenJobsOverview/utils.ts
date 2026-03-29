import type { AdminOpenJobRow } from "../../../../queries/admin/types";
import { downloadCsv } from "../../utils/csv";

export const JOB_STATUS_FILTER_ALL = "all" as const;

export type JobStatusFilter = typeof JOB_STATUS_FILTER_ALL | AdminOpenJobRow["status"];

export function filterOpenJobRows(
  rows: AdminOpenJobRow[],
  search: string,
  status: JobStatusFilter
): AdminOpenJobRow[] {
  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (status !== JOB_STATUS_FILTER_ALL && row.status !== status) return false;
    if (!q) return true;
    return (
      row.title.toLowerCase().includes(q) ||
      row.careseeker.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q) ||
      row.budgetLabel.toLowerCase().includes(q)
    );
  });
}

export function exportOpenJobsCsv(rows: AdminOpenJobRow[], filename: string) {
  const headers = ["ID", "Title", "Careseeker", "Status", "Posted", "Budget"];
  const body = rows.map((r) => [
    r.id,
    r.title,
    r.careseeker,
    r.status,
    r.postedAt,
    r.budgetLabel,
  ]);
  downloadCsv(filename, headers, body);
}
