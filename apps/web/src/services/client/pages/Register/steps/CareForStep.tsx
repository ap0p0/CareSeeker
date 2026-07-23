import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { Box, Stack, Typography } from "@mui/material";
import type { CareForChoice } from "../types";

type CareForStepProps = {
  onSelect: (choice: CareForChoice) => void;
};

const options: {
  value: CareForChoice;
  title: string;
  description: string;
  icon: typeof FavoriteBorderIcon;
  accent: "blue" | "pink";
}[] = [
  {
    value: "self",
    title: "I am looking for care",
    description: "I need help for myself.",
    icon: FavoriteBorderIcon,
    accent: "blue",
  },
  {
    value: "other",
    title: "Family member or friend",
    description: "I am looking for care for someone I love.",
    icon: GroupsOutlinedIcon,
    accent: "pink",
  },
];

const CareForStep = ({ onSelect }: CareForStepProps) => {
  return (
    <Stack spacing={2}>
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <Box
            key={option.value}
            component="button"
            type="button"
            onClick={() => onSelect(option.value)}
            sx={{
              all: "unset",
              cursor: "pointer",
              display: "block",
              width: 1,
              boxSizing: "border-box",
              p: 2.25,
              borderRadius: 3,
              border: "1px solid rgba(19, 53, 111, 0.1)",
              background: "rgba(255, 255, 255, 0.72)",
              transition:
                "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
              "&:hover": {
                borderColor: (t) =>
                  option.accent === "blue"
                    ? t.palette.custom.blue
                    : t.palette.custom.pink,
                boxShadow: "0 12px 28px rgba(15, 37, 80, 0.08)",
                transform: "translateY(-1px)",
              },
              "&:focus-visible": {
                outline: (t) =>
                  `2px solid ${
                    option.accent === "blue"
                      ? t.palette.custom.blue
                      : t.palette.custom.pink
                  }`,
                outlineOffset: 2,
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  bgcolor: (t) =>
                    option.accent === "blue"
                      ? `${t.palette.custom.blue}33`
                      : `${t.palette.custom.pink}55`,
                  color: (t) =>
                    option.accent === "blue"
                      ? t.palette.custom.blue
                      : "#8b6f96",
                }}
              >
                <Icon fontSize="small" />
              </Box>
              <Box>
                <Typography fontWeight={700} sx={{ color: "text.primary" }}>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </Box>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
};

export default CareForStep;
