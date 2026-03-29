import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type OverviewPageShellProps = {
  title: string;
  searchLabel?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterSlot?: React.ReactNode;
  onExportCsv: () => void;
  exportDisabled?: boolean;
  children: React.ReactNode;
};

const OverviewPageShell = ({
  title,
  searchLabel = "Search",
  searchValue,
  onSearchChange,
  filterSlot,
  onExportCsv,
  exportDisabled,
  children,
}: OverviewPageShellProps) => {
  return (
    <Stack spacing={2} sx={{ width: 1, minWidth: 0 }}>
      <Typography variant="h5" component="h1" fontWeight={600}>
        {title}
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        flexWrap="wrap"
        useFlexGap
      >
        <TextField
          size="small"
          label={searchLabel}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ minWidth: { xs: 1, sm: 260 }, flex: { sm: "1 1 200px" } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        {filterSlot ? <Box sx={{ minWidth: { sm: 180 } }}>{filterSlot}</Box> : null}
        <Button
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={onExportCsv}
          disabled={exportDisabled}
          sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
        >
          Export CSV
        </Button>
      </Stack>
      <Box sx={{ width: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
};

export default OverviewPageShell;
