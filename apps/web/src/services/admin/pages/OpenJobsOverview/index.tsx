import { Chip, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import type { AdminOpenJobRow } from "../../../../queries/admin/types";
import { useAdminOpenJobsQuery } from "../../../../queries/admin/useAdminOpenJobsQuery";
import AdminDataTable from "../../components/AdminDataTable";
import {
  sortAdminRows,
  type AdminTableColumn,
  type SortOrder,
} from "../../components/adminTableHelpers";
import OverviewPageShell from "../../components/OverviewPageShell";
import JobStatusFilterControl from "./JobStatusFilter";
import {
  exportOpenJobsCsv,
  filterOpenJobRows,
  JOB_STATUS_FILTER_ALL,
  type JobStatusFilter,
} from "./utils";

const columns: AdminTableColumn<AdminOpenJobRow>[] = [
  { id: "id", label: "ID", sortable: true, width: 110 },
  { id: "title", label: "Title", sortable: true },
  { id: "careseeker", label: "Careseeker", sortable: true },
  {
    id: "status",
    label: "Status",
    sortable: true,
    render: (row) => <Chip size="small" label={row.status} variant="outlined" />,
  },
  {
    id: "postedAt",
    label: "Posted",
    sortable: true,
    sortComparator: (a, b) => a.postedAt.localeCompare(b.postedAt),
  },
  { id: "budgetLabel", label: "Budget", sortable: true },
];

const OpenJobsOverviewPage = () => {
  const { data = [], isLoading } = useAdminOpenJobsQuery();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatusFilter>(JOB_STATUS_FILTER_ALL);
  const [orderBy, setOrderBy] = useState<keyof AdminOpenJobRow & string>("postedAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => filterOpenJobRows(data, search, status), [data, search, status]);

  const sorted = useMemo(
    () => sortAdminRows(filtered, orderBy, order, columns),
    [filtered, orderBy, order]
  );

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage]
  );

  const onSort = (columnId: keyof AdminOpenJobRow & string) => {
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
        title="Open jobs overview"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={
          <JobStatusFilterControl
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(0);
            }}
          />
        }
        onExportCsv={() =>
          exportOpenJobsCsv(sorted, `open-jobs-${new Date().toISOString().slice(0, 10)}.csv`)
        }
        exportDisabled={sorted.length === 0}
      >
        <AdminDataTable<AdminOpenJobRow>
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

export default OpenJobsOverviewPage;
