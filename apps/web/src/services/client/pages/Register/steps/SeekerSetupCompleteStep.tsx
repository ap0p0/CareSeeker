import { useEffect } from "react";
import { Box, Stack, Typography } from "@mui/material";
import filesStoringGif from "../../../../../assets/client/files-storing.gif";

const REDIRECT_MS = 3500;

type SeekerSetupCompleteStepProps = {
  onComplete: () => void;
};

const SeekerSetupCompleteStep = ({
  onComplete,
}: SeekerSetupCompleteStepProps) => {
  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      onComplete();
    }, REDIRECT_MS);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [onComplete]);

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={3}
      py={4}
      sx={{
        background:
          "linear-gradient(180deg, rgba(214, 232, 255, 0.42) 0%, rgba(247, 237, 248, 0.66) 100%)",
      }}
    >
      <Stack
        spacing={{ xs: 3, sm: 4 }}
        alignItems="center"
        textAlign="center"
        maxWidth={720}
        width={1}
      >
        <Typography
          component="h1"
          fontWeight={800}
          sx={{
            color: "custom.blue",
            fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Thank you for sharing your info.
          <br />
          Your account is being created.
        </Typography>

        <Box
          component="img"
          src={filesStoringGif}
          alt="Saving your care profile files"
          sx={{
            width: { xs: 180, sm: 220 },
            height: "auto",
            display: "block",
          }}
        />
      </Stack>
    </Box>
  );
};

export default SeekerSetupCompleteStep;
