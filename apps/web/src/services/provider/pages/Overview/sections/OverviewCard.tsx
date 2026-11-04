import type { ReactNode } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type OverviewCardProps = {
  title: string;
  description?: string;
  /** Settings URL for editing (profile pages). */
  editTo?: string;
  /** Inline quick edit (overview); takes precedence over `editTo`. */
  onEdit?: () => void;
  editLabel?: string;
  children: ReactNode;
};

/** Section container used by the overview, profile pages and dashboard. */
export const OverviewCard = ({
  title,
  description,
  editTo,
  onEdit,
  editLabel = "Edit",
  children,
}: OverviewCardProps) => (
  <Paper
    elevation={0}
    component="section"
    aria-label={title}
    sx={{
      p: { xs: 2.5, md: 3 },
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      height: "100%",
    }}
  >
    <Stack spacing={2}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Box>
        {onEdit ? (
          <Button
            size="small"
            onClick={onEdit}
            startIcon={<EditOutlinedIcon />}
            sx={{ textTransform: "none", flexShrink: 0 }}
          >
            {editLabel}
          </Button>
        ) : editTo ? (
          <Button
            component={RouterLink}
            to={editTo}
            size="small"
            startIcon={<EditOutlinedIcon />}
            sx={{ textTransform: "none", flexShrink: 0 }}
          >
            {editLabel}
          </Button>
        ) : null}
      </Stack>
      {children}
    </Stack>
  </Paper>
);

/** Label + value rows. */
export const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" },
      gap: { xs: 0.25, sm: 2 },
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" component="div">
      {value ?? "—"}
    </Typography>
  </Box>
);

/** Chip list for multi-select answers. */
export const ChipList = ({
  items,
  emptyText = "None",
  color,
}: {
  items: string[];
  emptyText?: string;
  color?: "default" | "primary" | "warning";
}) =>
  items.length === 0 ? (
    <Typography variant="body2" color="text.secondary">
      {emptyText}
    </Typography>
  ) : (
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75}>
      {items.map((item) => (
        <Chip
          key={item}
          label={item}
          size="small"
          variant="outlined"
          color={color}
        />
      ))}
    </Stack>
  );

/** Placeholder for a section that has not been filled in. */
export const MissingSection = ({
  text,
  to,
  onAction,
  action = "Add now",
}: {
  text: string;
  to: string;
  onAction?: () => void;
  action?: string;
}) => (
  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
    {onAction ? (
      <Button size="small" variant="outlined" onClick={onAction}>
        {action}
      </Button>
    ) : (
      <Button component={RouterLink} to={to} size="small" variant="outlined">
        {action}
      </Button>
    )}
  </Stack>
);
