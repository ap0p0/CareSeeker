import type { AdminCareProviderRow } from "../../../../queries/admin/types";
import { downloadCsv } from "../../utils/csv";

export const VERIFICATION_FILTER_ALL = "all" as const;

export type VerificationFilter =
  | typeof VERIFICATION_FILTER_ALL
  | AdminCareProviderRow["verificationStatus"];

export function filterCareProviderRows(
  rows: AdminCareProviderRow[],
  search: string,
  verification: VerificationFilter,
): AdminCareProviderRow[] {
  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (
      verification !== VERIFICATION_FILTER_ALL &&
      row.verificationStatus !== verification
    ) {
      return false;
    }
    if (!q) return true;
    return (
      row.name.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      row.specialty.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q)
    );
  });
}

export function exportCareProvidersCsv(
  rows: AdminCareProviderRow[],
  filename: string,
) {
  const headers = [
    "ID",
    "Name",
    "Email",
    "Verification",
    "Specialty",
    "Joined",
  ];
  const body = rows.map((r) => [
    r.id,
    r.name,
    r.email,
    r.verificationStatus,
    r.specialty,
    r.joinedAt,
  ]);
  downloadCsv(filename, headers, body);
}
