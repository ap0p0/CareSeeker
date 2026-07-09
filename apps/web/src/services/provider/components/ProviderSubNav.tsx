import { Tab, Tabs } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

export type ProviderSubNavItem = {
  label: string;
  to: string;
  end?: boolean;
};

type ProviderSubNavProps = {
  items: ProviderSubNavItem[];
  ariaLabel: string;
};

const ProviderSubNav = ({ items, ariaLabel }: ProviderSubNavProps) => {
  const location = useLocation();

  const activeIndex = items.findIndex((item) => {
    if (item.end) {
      return location.pathname === item.to;
    }

    return (
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`)
    );
  });

  return (
    <Tabs
      value={activeIndex === -1 ? false : activeIndex}
      variant="scrollable"
      scrollButtons="auto"
      aria-label={ariaLabel}
      sx={{
        mb: 2,
        borderBottom: 1,
        borderColor: "divider",
        "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
      }}
    >
      {items.map((item, index) => (
        <Tab
          key={item.to}
          label={item.label}
          component={RouterLink}
          to={item.to}
          value={index}
        />
      ))}
    </Tabs>
  );
};

export default ProviderSubNav;
