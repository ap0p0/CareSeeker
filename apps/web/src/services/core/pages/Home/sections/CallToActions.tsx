import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

const CallToActions = () => {
  return (
    <Box
      component="section"
      sx={{
        width: "100vw",
        maxWidth: "100vw",
        minHeight: "100dvh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        bgcolor: "white",

        flexDirection: "column",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            fontWeight={500}
            sx={{ fontSize: { xs: "1.7rem", md: "2.2rem" } }}
          >
            Care, Matched with{" "}
            <Box component="span" sx={{ color: (t) => t.palette.custom.blue }}>
              Confidence
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              mt: 1.5,
              fontSize: { xs: "1rem", md: "1.15rem" },
              maxWidth: 900,
              mx: "auto",
            }}
          >
            You&apos;re not just hiring help. You&apos;re trusting others with
            someone you love.
          </Typography>
          <Typography
            sx={{
              color: (t) => t.palette.custom.blue,
              fontSize: { xs: "1rem", md: "1.15rem" },
              maxWidth: 900,
              mx: "auto",
            }}
          >
            CareSeeker was built to honor that trust.
          </Typography>
        </Box>

        <Box
          alignItems="center"
          justifyContent="center"
          sx={{ display: "flex", mb: { xs: 3, md: 4 } }}
        >
          <Button
            variant="contained"
            sx={{
              textDecoration: "none !important",
              fontWeight: "normal",
              bgcolor: "#5ea6d4",

              fontSize: "16px",

              minWidth: {
                xs: "160px",
                sm: "190px",
                md: "220px",
              },

              height: {
                xs: "45px",
                md: "50px",
              },

              borderRadius: "25px",

              "&:hover": {
                bgcolor: "#4b94c3",
                transform: "scale(1.05)",
                color: "#000",
                textDecoration: "none !important",
                boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                fontWeight: "normal",
              },
            }}
          >
            Get Started Today
          </Button>
        </Box>
      </Container>

      <Box
        component="footer"
        sx={{
          width: "100%",
          bgcolor: "#efe7f2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "left",
          py: { xs: 3, md: 4 },
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            maxWidth: "1200px",
            fontSize: { xs: "0.65rem", md: "0.75rem" },
            lineHeight: 1.6,
            color: "text.secondary",
            textAlign: "normal",
          }}
        >
          CareSeeker is a healthcare technology company and not a medical
          provider. All medical services are provided by independent or
          contracted third parties. Although CareSeeker may facilitate easy
          access to medical service providers on your behalf, you are free to
          choose any healthcare provider and to continue to use CareSeeker’s
          services. CareSeeker’s services are not a substitute for medical care,
          medical advice, and/or a detailed discussion with your primary care
          physician or other licensed provider. All material, information, data,
          and content that CareSeeker provides is strictly for general
          information purposes.
        </Typography>

        <Typography
          sx={{
            mt: 2,
            fontSize: { xs: "0.65rem", md: "0.75rem" },
            fontWeight: 500,
            color: "text.secondary",
          }}
        >
          © 2026 CareSeeker
        </Typography>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,

          "& .label": {
            opacity: 0,
            transform: "translateY(20px)",
            transition: "all .35s cubic-bezier(.16,1,.3,1)",
            color: "black",
            fontSize: "16px",
            fontWeight: 500,
            cursor: "pointer",
          },

          "&:hover .label": {
            opacity: 1,
            transform: "translateY(0)",
            backgroundColor: "none",
          },
        }}
      >
        <Button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          sx={{
            minWidth: "auto",
            padding: 0,
            bgcolor: "blurry",
            color: "inherit",
            boxShadow: "none",

            "&:hover": {
              bgcolor: "blurry",
              boxShadow: "none",
            },
          }}
        >
          <Typography className="label">Back to Top</Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default CallToActions;
