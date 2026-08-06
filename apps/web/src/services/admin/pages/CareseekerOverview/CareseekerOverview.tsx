import { Chip, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import type { AdminCareseekerRow } from "../../../../queries/admin/types";
import { useAdminCareseekersQuery } from "../../../../queries/admin/useAdminCareseekersQuery";
import AdminDataTable from "../../components/AdminDataTable";
import {
  sortAdminRows,
  type AdminTableColumn,
  type SortOrder,
} from "../../components/adminTableHelpers";
import OverviewPageShell from "../../components/OverviewPageShell";
import CareseekerStatusFilterControl from "./CareseekerStatusFilter";
import {
  exportCareseekersCsv,
  filterCareseekerRows,
  STATUS_FILTER_ALL,
  type CareseekerStatusFilter,
} from "./utils";

const columns: AdminTableColumn<AdminCareseekerRow>[] = [
  { id: "id", label: "ID", sortable: true, width: 100 },
  { id: "name", label: "Name", sortable: true },
  { id: "email", label: "Email", sortable: true },
  {
    id: "status",
    label: "Status",
    sortable: true,
    render: (row) => (
      <Chip
        size="small"
        label={row.status}
        variant="outlined"
        color="primary"
      />
    ),
  },
  {
    id: "joinedAt",
    label: "Joined",
    sortable: true,
    sortComparator: (a, b) => a.joinedAt.localeCompare(b.joinedAt),
  },
  { id: "city", label: "City", sortable: true },
];

const CareseekerOverviewPage = () => {
  const { data = [], isLoading } = useAdminCareseekersQuery();
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<CareseekerStatusFilter>(STATUS_FILTER_ALL);
  const [orderBy, setOrderBy] = useState<keyof AdminCareseekerRow & string>(
    "name",
  );
  const [order, setOrder] = useState<SortOrder>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(
    () => filterCareseekerRows(data, search, status),
    [data, search, status],
  );

  const sorted = useMemo(
    () => sortAdminRows(filtered, orderBy, order, columns),
    [filtered, orderBy, order],
  );

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage],
  );

  const onSort = (columnId: keyof AdminCareseekerRow & string) => {
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
        title="Careseeker overview"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={
          <CareseekerStatusFilterControl
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(0);
            }}
          />
        }
        onExportCsv={() =>
          exportCareseekersCsv(
            sorted,
            `careseekers-${new Date().toISOString().slice(0, 10)}.csv`,
          )
        }
        exportDisabled={sorted.length === 0}
      >
        <AdminDataTable<AdminCareseekerRow>
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

export default CareseekerOverviewPage;
