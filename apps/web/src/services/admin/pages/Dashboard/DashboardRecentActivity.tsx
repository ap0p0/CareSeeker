import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import type { AdminRecentActivityItem } from "../../../../queries/admin/types";
import { formatRelativeUtc } from "./utils";

type DashboardRecentActivityProps = {
  items: AdminRecentActivityItem[];
};

const DashboardRecentActivity = ({ items }: DashboardRecentActivityProps) => {
  return (
    <Card variant="outlined">
      <CardHeader title="Recent activity" subheader="Latest platform events (sample data)" />
      <Divider />
      <CardContent sx={{ pt: 0 }}>
        {items.length === 0 ? (
          <Typography color="text.secondary" variant="body2" sx={{ py: 2 }}>
            No recent activity.
          </Typography>
        ) : (
          <List dense disablePadding>
            {items.map((item) => (
              <ListItem key={item.id} alignItems="flex-start" disableGutters sx={{ py: 1 }}>
                <ListItemText
                  primary={item.message}
                  secondary={formatRelativeUtc(item.at)}
                  primaryTypographyProps={{ variant: "body2" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardRecentActivity;
