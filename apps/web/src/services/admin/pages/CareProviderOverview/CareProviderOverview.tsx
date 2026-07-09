import { Chip, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import type { AdminCareProviderRow } from "../../../../queries/admin/types";
import { useAdminCareProvidersQuery } from "../../../../queries/admin/useAdminCareProvidersQuery";
import AdminDataTable from "../../components/AdminDataTable";
import {
  sortAdminRows,
  type AdminTableColumn,
  type SortOrder,
} from "../../components/adminTableHelpers";
import OverviewPageShell from "../../components/OverviewPageShell";
import VerificationFilterControl from "./VerificationFilter";
import {
  exportCareProvidersCsv,
  filterCareProviderRows,
  VERIFICATION_FILTER_ALL,
  type VerificationFilter,
} from "./utils";

const columns: AdminTableColumn<AdminCareProviderRow>[] = [
  { id: "id", label: "ID", sortable: true, width: 100 },
  { id: "name", label: "Name", sortable: true },
  { id: "email", label: "Email", sortable: true },
  {
    id: "verificationStatus",
    label: "Verification",
    sortable: true,
    render: (row) => (
      <Chip
        size="small"
        label={row.verificationStatus}
        variant="outlined"
        color={
          row.verificationStatus === "verified"
            ? "success"
            : row.verificationStatus === "rejected"
              ? "error"
              : "warning"
        }
      />
    ),
  },
  { id: "specialty", label: "Specialty", sortable: true },
  {
    id: "joinedAt",
    label: "Joined",
    sortable: true,
    sortComparator: (a, b) => a.joinedAt.localeCompare(b.joinedAt),
  },
];

const CareProviderOverviewPage = () => {
  const { data = [], isLoading } = useAdminCareProvidersQuery();
  const [search, setSearch] = useState("");
  const [verification, setVerification] = useState<VerificationFilter>(VERIFICATION_FILTER_ALL);
  const [orderBy, setOrderBy] = useState<keyof AdminCareProviderRow & string>("name");
  const [order, setOrder] = useState<SortOrder>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(
    () => filterCareProviderRows(data, search, verification),
    [data, search, verification]
  );

  const sorted = useMemo(
    () => sortAdminRows(filtered, orderBy, order, columns),
    [filtered, orderBy, order]
  );

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage]
  );

  const onSort = (columnId: keyof AdminCareProviderRow & string) => {
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
        title="Care provider overview"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={
          <VerificationFilterControl
            value={verification}
            onChange={(v) => {
              setVerification(v);
              setPage(0);
            }}
          />
        }
        onExportCsv={() =>
          exportCareProvidersCsv(
            sorted,
            `care-providers-${new Date().toISOString().slice(0, 10)}.csv`
          )
        }
        exportDisabled={sorted.length === 0}
      >
        <AdminDataTable<AdminCareProviderRow>
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

export default CareProviderOverviewPage;
