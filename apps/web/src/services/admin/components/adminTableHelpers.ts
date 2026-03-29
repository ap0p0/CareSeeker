import type { ReactNode } from "react";

export type SortOrder = "asc" | "desc";

export type AdminTableColumn<Row extends object> = {
  id: keyof Row & string;
  label: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  width?: string | number;
  sortComparator?: (a: Row, b: Row) => number;
  render?: (row: Row) => ReactNode;
};

export function defaultComparator(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function sortAdminRows<Row extends object>(
  rows: Row[],
  orderBy: keyof Row & string,
  order: SortOrder,
  columns: AdminTableColumn<Row>[]
): Row[] {
  const col = columns.find((c) => c.id === orderBy);
  return [...rows].sort((a, b) => {
    const v = col?.sortComparator
      ? col.sortComparator(a, b)
      : defaultComparator(
          a[orderBy as keyof Row],
          b[orderBy as keyof Row]
        );
    return order === "asc" ? v : -v;
  });
}
