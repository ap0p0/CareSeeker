import type { ReactNode } from "react";
import { useState } from "react";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import { Box, Button, Stack, Typography } from "@mui/material";
import type {
  JobActivity,
  JobActivityKind,
} from "../../../../../queries/client";
import { timeAgo } from "../jobDetailsDisplay";
import SectionCard from "./SectionCard";

const ICONS: Record<JobActivityKind, ReactNode> = {
  posted: <CampaignOutlinedIcon fontSize="inherit" />,
  edited: <EditOutlinedIcon fontSize="inherit" />,
  applied: <PersonAddAlt1OutlinedIcon fontSize="inherit" />,
  interview: <EventOutlinedIcon fontSize="inherit" />,
  offer: <LocalOfferOutlinedIcon fontSize="inherit" />,
  hired: <HandshakeOutlinedIcon fontSize="inherit" />,
  paused: <PauseCircleOutlineIcon fontSize="inherit" />,
  closure_requested: <ArchiveOutlinedIcon fontSize="inherit" />,
  closed: <ArchiveOutlinedIcon fontSize="inherit" />,
  payment: <PaymentsOutlinedIcon fontSize="inherit" />,
};

const COLLAPSED = 6;

/** What happened on the job, newest first. */
const ActivityCard = ({ activity }: { activity: JobActivity[] }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? activity : activity.slice(0, COLLAPSED);

  return (
    <SectionCard
      title="Activity"
      icon={<HistoryOutlinedIcon fontSize="small" />}
    >
      <Stack component="ol" sx={{ m: 0, p: 0, listStyle: "none" }}>
        {shown.map((item, index) => (
          <Stack
            component="li"
            key={`${item.at}-${item.text}`}
            direction="row"
            spacing={1.5}
          >
            {/* Icon on a vertical line. */}
            <Stack alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "grey.100",
                  color: "text.secondary",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {ICONS[item.kind]}
              </Box>
              {index < shown.length - 1 ? (
                <Box
                  sx={{ width: 2, flex: 1, minHeight: 12, bgcolor: "divider" }}
                />
              ) : null}
            </Stack>
            <Box sx={{ pb: 1.5, pt: 0.25 }}>
              <Typography variant="body2">{item.text}</Typography>
              <Typography variant="caption" color="text.secondary">
                {timeAgo(item.at)}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
      {activity.length > COLLAPSED ? (
        <Button
          size="small"
          onClick={() => setExpanded((current) => !current)}
          sx={{
            alignSelf: "flex-start",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {expanded ? "Show less" : `Show all ${activity.length} events`}
        </Button>
      ) : null}
    </SectionCard>
  );
};

export default ActivityCard;
