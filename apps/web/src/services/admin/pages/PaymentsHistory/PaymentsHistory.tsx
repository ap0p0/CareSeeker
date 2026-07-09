import { Chip, Stack } from "@mui/material";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import type { AdminPaymentRow } from "../../../../queries/admin/types";
import { useAdminPaymentsHistoryQuery } from "../../../../queries/admin/useAdminPaymentsHistoryQuery";
import AdminDataTable from "../../components/AdminDataTable";
import {
  sortAdminRows,
  type AdminTableColumn,
  type SortOrder,
} from "../../components/adminTableHelpers";
import OverviewPageShell from "../../components/OverviewPageShell";
import PaymentStatusFilterControl from "./PaymentStatusFilter";
import {
  exportPaymentsCsv,
  filterPaymentRows,
  formatPaymentAmount,
  PAYMENT_STATUS_FILTER_ALL,
  type PaymentStatusFilter,
} from "./utils";

const columns: AdminTableColumn<AdminPaymentRow>[] = [
  { id: "id", label: "ID", sortable: true, width: 100 },
  {
    id: "paidAt",
    label: "Paid at",
    sortable: true,
    sortComparator: (a, b) => a.paidAt.localeCompare(b.paidAt),
    render: (row) => dayjs(row.paidAt).format("YYYY-MM-DD HH:mm"),
  },
  {
    id: "amountCents",
    label: "Amount",
    align: "right",
    sortable: true,
    sortComparator: (a, b) => a.amountCents - b.amountCents,
    render: (row) => formatPaymentAmount(row),
  },
  { id: "payer", label: "Payer", sortable: true },
  { id: "payee", label: "Payee", sortable: true },
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
          row.status === "completed"
            ? "success"
            : row.status === "failed"
              ? "error"
              : "warning"
        }
      />
    ),
  },
];

const PaymentsHistoryPage = () => {
  const { data = [], isLoading } = useAdminPaymentsHistoryQuery();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatusFilter>(PAYMENT_STATUS_FILTER_ALL);
  const [orderBy, setOrderBy] = useState<keyof AdminPaymentRow & string>("paidAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => filterPaymentRows(data, search, status), [data, search, status]);

  const sorted = useMemo(
    () => sortAdminRows(filtered, orderBy, order, columns),
    [filtered, orderBy, order]
  );

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage]
  );

  const onSort = (columnId: keyof AdminPaymentRow & string) => {
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
        title="Payments history"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={
          <PaymentStatusFilterControl
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(0);
            }}
          />
        }
        onExportCsv={() =>
          exportPaymentsCsv(sorted, `payments-${new Date().toISOString().slice(0, 10)}.csv`)
        }
        exportDisabled={sorted.length === 0}
      >
        <AdminDataTable<AdminPaymentRow>
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

export default PaymentsHistoryPage;
