import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { JobSection } from "../jobLinks";
import { sectionAnchor } from "../jobDetailsDisplay";

type SectionCardProps = {
  title: string;
  /** Short line under the title. */
  subtitle?: ReactNode;
  /** Shown on the right of the title (count, button…). */
  action?: ReactNode;
  /** Deep-link target of `?section=` (scrolled to and highlighted). */
  section?: JobSection;
  highlighted?: boolean;
  icon?: ReactNode;
  children: ReactNode;
};

/** A titled card of the job page. */
const SectionCard = ({
  title,
  subtitle,
  action,
  section,
  highlighted = false,
  icon,
  children,
}: SectionCardProps) => (
  <Paper
    elevation={0}
    component="section"
    id={section ? sectionAnchor(section) : undefined}
    aria-label={title}
    sx={(theme) => ({
      p: { xs: 2, md: 2.5 },
      borderRadius: 3,
      border: "1px solid",
      borderColor: highlighted ? "primary.main" : "divider",
      boxShadow: highlighted
        ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`
        : "none",
      transition: "border-color 300ms, box-shadow 300ms",
      // Leave room for the page top when scrolled to.
      scrollMarginTop: 16,
    })}
  >
    <Stack spacing={1.75}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
      >
        <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
          {icon ? (
            <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
          ) : null}
          <Box minWidth={0}>
            <Typography variant="subtitle1" component="h2" fontWeight={700}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Stack>
        {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
      </Stack>
      {children}
    </Stack>
  </Paper>
);

export default SectionCard;
