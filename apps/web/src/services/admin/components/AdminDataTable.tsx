import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import type { AdminTableColumn, SortOrder } from "./adminTableHelpers";

type AdminDataTableProps<Row extends object> = {
  columns: AdminTableColumn<Row>[];
  rows: Row[];
  orderBy: keyof Row & string;
  order: SortOrder;
  onSort: (columnId: keyof Row & string) => void;
  page: number;
  rowsPerPage: number;
  totalFiltered: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  emptyMessage?: string;
  loading?: boolean;
  getRowId?: (row: Row) => string;
};

function AdminDataTable<Row extends object>({
  columns,
  rows,
  orderBy,
  order,
  onSort,
  page,
  rowsPerPage,
  totalFiltered,
  onPageChange,
  onRowsPerPageChange,
  emptyMessage = "No rows match your filters.",
  loading,
  getRowId,
}: AdminDataTableProps<Row>) {
  return (
    <Paper variant="outlined" sx={{ width: 1, overflow: "hidden" }}>
      <TableContainer sx={{ maxWidth: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{ width: col.width, fontWeight: 600 }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => onSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    Loading…
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={getRowId ? getRowId(row) : idx} hover>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align}>
                      {col.render
                        ? col.render(row)
                        : (row[col.id as keyof Row] as ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalFiltered}
        page={page}
        onPageChange={(_, p) => onPageChange(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange(Number.parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Paper>
  );
}

export default AdminDataTable;
