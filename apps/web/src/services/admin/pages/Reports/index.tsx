import { Chip, Stack } from "@mui/material";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import type { AdminReportRow } from "../../../../queries/admin/types";
import { useAdminReportsQuery } from "../../../../queries/admin/useAdminReportsQuery";
import AdminDataTable from "../../components/AdminDataTable";
import {
  sortAdminRows,
  type AdminTableColumn,
  type SortOrder,
} from "../../components/adminTableHelpers";
import OverviewPageShell from "../../components/OverviewPageShell";
import ReportStatusFilterControl from "./ReportStatusFilter";
import {
  exportReportsCsv,
  filterReportRows,
  REPORT_STATUS_FILTER_ALL,
  type ReportStatusFilter,
} from "./utils";

const columns: AdminTableColumn<AdminReportRow>[] = [
  { id: "id", label: "ID", sortable: true, width: 90 },
  { id: "name", label: "Report", sortable: true },
  { id: "category", label: "Category", sortable: true },
  {
    id: "generatedAt",
    label: "Generated",
    sortable: true,
    sortComparator: (a, b) => a.generatedAt.localeCompare(b.generatedAt),
    render: (row) => dayjs(row.generatedAt).format("YYYY-MM-DD HH:mm"),
  },
  {
    id: "status",
    label: "Status",
    sortable: true,
    render: (row) => (
      <Chip
        size="small"
        label={row.status}
        variant="outlined"
        color={
          row.status === "ready" ? "success" : row.status === "failed" ? "error" : "info"
        }
      />
    ),
  },
];

const ReportsPage = () => {
  const { data = [], isLoading } = useAdminReportsQuery();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReportStatusFilter>(REPORT_STATUS_FILTER_ALL);
  const [orderBy, setOrderBy] = useState<keyof AdminReportRow & string>("generatedAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => filterReportRows(data, search, status), [data, search, status]);

  const sorted = useMemo(
    () => sortAdminRows(filtered, orderBy, order, columns),
    [filtered, orderBy, order]
  );

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage]
  );

  const onSort = (columnId: keyof AdminReportRow & string) => {
    if (columnId === orderBy) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(columnId);
      setOrder("asc");
    }
    setPage(0);
  };

  return (
    <Stack spacing={0}>
      <OverviewPageShell
        title="Reports"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={
          <ReportStatusFilterControl
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(0);
            }}
          />
        }
        onExportCsv={() =>
          exportReportsCsv(sorted, `reports-${new Date().toISOString().slice(0, 10)}.csv`)
        }
        exportDisabled={sorted.length === 0}
      >
        <AdminDataTable<AdminReportRow>
          columns={columns}
          rows={paged}
          orderBy={orderBy}
          order={order}
          onSort={onSort}
          page={page}
          rowsPerPage={rowsPerPage}
          totalFiltered={sorted.length}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setPage(0);
          }}
          loading={isLoading}
          getRowId={(r) => r.id}
        />
      </OverviewPageShell>
    </Stack>
  );
};

export default ReportsPage;
