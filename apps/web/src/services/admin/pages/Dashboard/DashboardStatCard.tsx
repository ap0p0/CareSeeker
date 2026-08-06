import type { ReactNode } from "react";
import { Card, CardContent, Typography } from "@mui/material";

type DashboardStatCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: string;
};

const DashboardStatCard = ({
  title,
  value,
  subtitle,
}: DashboardStatCardProps) => {
  return (
    <Card variant="outlined" sx={{ height: 1 }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="p" fontWeight={700}>
          {value}
        </Typography>
        {subtitle ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default DashboardStatCard;
