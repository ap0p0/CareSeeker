import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid2";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../routes/enums";
import providerWaitlistHeroImage from "../../../../assets/core-images/provider-waitlist-hero.png";

const usStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

const stateCityOptions: Record<string, string[]> = {
  Alabama: ["Birmingham", "Montgomery", "Mobile", "Huntsville"],
  Alaska: ["Anchorage", "Fairbanks", "Juneau", "Sitka"],
  Arizona: ["Phoenix", "Tucson", "Mesa", "Scottsdale"],
  Arkansas: ["Little Rock", "Fayetteville", "Fort Smith", "Jonesboro"],
  California: ["Los Angeles", "San Diego", "San Jose", "Sacramento"],
  Colorado: ["Denver", "Colorado Springs", "Aurora", "Boulder"],
  Connecticut: ["Bridgeport", "New Haven", "Hartford", "Stamford"],
  Delaware: ["Wilmington", "Dover", "Newark", "Middletown"],
  Florida: ["Miami", "Orlando", "Tampa", "Jacksonville"],
  Georgia: ["Atlanta", "Savannah", "Augusta", "Athens"],
  Hawaii: ["Honolulu", "Hilo", "Kailua", "Pearl City"],
  Idaho: ["Boise", "Meridian", "Nampa", "Idaho Falls"],
  Illinois: ["Chicago", "Aurora", "Naperville", "Springfield"],
  Indiana: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend"],
  Iowa: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City"],
  Kansas: ["Wichita", "Overland Park", "Topeka", "Lawrence"],
  Kentucky: ["Louisville", "Lexington", "Bowling Green", "Owensboro"],
  Louisiana: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette"],
  Maine: ["Portland", "Lewiston", "Bangor", "South Portland"],
  Maryland: ["Baltimore", "Annapolis", "Frederick", "Rockville"],
  Massachusetts: ["Boston", "Worcester", "Springfield", "Cambridge"],
  Michigan: ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing"],
  Minnesota: ["Minneapolis", "Saint Paul", "Rochester", "Duluth"],
  Mississippi: ["Jackson", "Gulfport", "Southaven", "Hattiesburg"],
  Missouri: ["Kansas City", "Saint Louis", "Springfield", "Columbia"],
  Montana: ["Billings", "Missoula", "Bozeman", "Great Falls"],
  Nebraska: ["Omaha", "Lincoln", "Bellevue", "Grand Island"],
  Nevada: ["Las Vegas", "Henderson", "Reno", "North Las Vegas"],
  "New Hampshire": ["Manchester", "Nashua", "Concord", "Dover"],
  "New Jersey": ["Newark", "Jersey City", "Paterson", "Trenton"],
  "New Mexico": ["Albuquerque", "Santa Fe", "Las Cruces", "Roswell"],
  "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
  "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham"],
  "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot"],
  Ohio: ["Columbus", "Cleveland", "Cincinnati", "Toledo"],
  Oklahoma: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow"],
  Oregon: ["Portland", "Eugene", "Salem", "Gresham"],
  Pennsylvania: ["Philadelphia", "Pittsburgh", "Allentown", "Harrisburg"],
  "Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket"],
  "South Carolina": ["Charleston", "Columbia", "Greenville", "Spartanburg"],
  "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings"],
  Tennessee: ["Nashville", "Memphis", "Knoxville", "Chattanooga"],
  Texas: ["Houston", "Dallas", "Austin", "San Antonio"],
  Utah: ["Salt Lake City", "West Valley City", "Provo", "Ogden"],
  Vermont: ["Burlington", "South Burlington", "Rutland", "Montpelier"],
  Virginia: ["Virginia Beach", "Richmond", "Norfolk", "Alexandria"],
  Washington: ["Seattle", "Spokane", "Tacoma", "Vancouver"],
  "West Virginia": ["Charleston", "Huntington", "Morgantown", "Wheeling"],
  Wisconsin: ["Milwaukee", "Madison", "Green Bay", "Kenosha"],
  Wyoming: ["Cheyenne", "Casper", "Laramie", "Gillette"],
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: "rgba(255,255,255,0.75)",
    boxShadow: "0 6px 20px rgba(19, 33, 68, 0.06)",
    "& .MuiInputBase-input": {
      py: { xs: 1.35, md: 1.05 },
    },
    "& fieldset": {
      borderColor: "rgba(92, 124, 160, 0.22)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(184, 159, 193, 0.8)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(94, 166, 212, 0.95)",
      borderWidth: 2,
    },
  },
} as const;

const backToHomeButtonSx = {
  alignSelf: "flex-start",
  mb: { xs: 1.2, md: 1.25 },
  px: 1.35,
  py: 0.45,
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 600,
  fontSize: { xs: "0.85rem", md: "0.82rem" },
  color: "#fff",
  bgcolor: "rgba(94, 166, 212, 0.7)",
  border: "1px solid rgba(94, 166, 212, 0.45)",
  textDecoration: "none",
  transition:
    "background-color 240ms ease-in-out, color 240ms ease-in-out, transform 240ms ease-in-out, box-shadow 240ms ease-in-out",
  "&:hover": {
    color: "#000",
    bgcolor: "rgba(184, 159, 193, 0.3)",
    borderColor: "rgba(184, 159, 193, 0.6)",
    transform: "translateY(-1px)",
    boxShadow: "0 8px 18px rgba(15, 37, 80, 0.1)",
    textDecoration: "none",
  },
} as const;

const formatPhoneNumber = (rawValue: string) => {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 10);
  const part1 = digitsOnly.slice(0, 3);
  const part2 = digitsOnly.slice(3, 6);
  const part3 = digitsOnly.slice(6, 10);

  if (!part1) return "";
  if (!part2) return `(${part1}`;
  if (!part3) return `(${part1}) ${part2}`;
  return `(${part1}) ${part2}-${part3}`;
};

const GiveCare = () => {
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [stateValue, setStateValue] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const cityOptions = useMemo(
    () => (stateValue ? (stateCityOptions[stateValue] ?? []) : []),
    [stateValue]
  );

  const hasValidState = Boolean(stateValue && usStates.includes(stateValue));
  const hasValidCity = city.trim().length > 0;
  const phoneDigits = phone.replace(/\D/g, "");
  const hasValidPhone = phoneDigits.length === 0 || phoneDigits.length === 10;

  const showStateError = isSubmitted && !hasValidState;
  const showCityError = isSubmitted && !hasValidCity;
  const showPhoneError = isSubmitted && !hasValidPhone;

  const canSubmit =
    accepted &&
    name.trim().length > 0 &&
    surname.trim().length > 0 &&
    email.trim().length > 0 &&
    hasValidState &&
    hasValidCity &&
    hasValidPhone;

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        height: { md: "100vh" },
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #f7edf8 0%, #ffffff 60%)",
        py: { xs: 3, md: 0 },
        overflowY: { md: "hidden" },
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 3, md: 2.25 }}
          alignItems="stretch"
          sx={{ height: { md: "90vh" }, maxHeight: { md: "90vh" } }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: { xs: 4, md: 6 },
                px: { xs: 2.5, sm: 3.25, md: 4 },
                py: { xs: 3, md: 2.5 },
                background:
                  "linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(255,250,255,0.84) 100%)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 14px 34px rgba(15, 37, 80, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: { md: "center" },
              }}
            >
              <Button
                component={RouterLink}
                to={BASE_ROUTE_PATHS[BaseRoute.Home]}
                variant="outlined"
                sx={backToHomeButtonSx}
              >
                {"\u2190 Back to Home"}
              </Button>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: (t) => t.palette.custom.blue,
                  letterSpacing: 0.2,
                  fontSize: { xs: "1.45rem", md: "1.32rem" },
                  mb: { xs: 1.8, md: 1.2 },
                }}
              >
                CareSeeker
              </Typography>

              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  fontSize: { xs: "2rem", sm: "2.35rem", md: "2.2rem" },
                  lineHeight: { xs: 1.15, md: 1.1 },
                }}
              >
                Join as a Care Provider
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  mt: { xs: 1.1, md: 0.75 },
                  mb: { xs: 3, md: 1.75 },
                  fontSize: { xs: "1rem", md: "0.96rem" },
                }}
              >
                Start receiving care opportunities when we launch.
              </Typography>

              <Stack
                component="form"
                spacing={{ xs: 1.55, md: 1.1 }}
                onSubmit={(event) => {
                  event.preventDefault();
                  setIsSubmitted(true);
                }}
              >
                <TextField
                  label="Name"
                  name="name"
                  required
                  fullWidth
                  autoComplete="given-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  sx={inputSx}
                />
                <TextField
                  label="Surname"
                  name="surname"
                  required
                  fullWidth
                  autoComplete="family-name"
                  value={surname}
                  onChange={(event) => setSurname(event.target.value)}
                  sx={inputSx}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  fullWidth
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  sx={inputSx}
                />

                <Autocomplete
                  options={usStates as unknown as string[]}
                  value={stateValue}
                  onChange={(_, newValue) => {
                    setStateValue(newValue);
                    setCity("");
                  }}
                  sx={inputSx}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="State"
                      placeholder="Select your state"
                      error={showStateError}
                      helperText={
                        showStateError ? "Select a valid US state" : undefined
                      }
                    />
                  )}
                />

                <Autocomplete
                  freeSolo
                  options={cityOptions}
                  value={city}
                  inputValue={city}
                  onInputChange={(_, newInputValue) => setCity(newInputValue)}
                  onChange={(_, newValue) => setCity(newValue ?? "")}
                  disabled={!stateValue}
                  sx={inputSx}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="City"
                      placeholder="Enter your city"
                      error={showCityError}
                      helperText={
                        !stateValue
                          ? "Select your state first"
                          : showCityError
                            ? "City is required"
                            : undefined
                      }
                    />
                  )}
                />

                <Typography
                  sx={{
                    mt: { xs: -0.3, md: -0.2 },
                    mb: { xs: 0.15, md: 0.05 },
                    fontSize: { xs: "0.85rem", md: "0.8rem" },
                    color: "text.secondary",
                  }}
                >
                  We use this to match you with nearby opportunities
                </Typography>

                <TextField
                  fullWidth
                  label="Phone"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(event) =>
                    setPhone(formatPhoneNumber(event.target.value))
                  }
                  error={showPhoneError}
                  helperText={
                    showPhoneError
                      ? "Enter a valid US phone number"
                      : "Optional - helps you get contacted faster"
                  }
                  sx={inputSx}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              pr: 1,
                              mr: 0.25,
                              borderRight: "1px solid rgba(92,124,160,0.35)",
                              color: "text.secondary",
                              fontWeight: 600,
                            }}
                          >
                            <Box component="span" aria-hidden>
                              🇺🇸
                            </Box>
                            <Box component="span">+1</Box>
                          </Box>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      sx={{
                        color: (t) => t.palette.custom.blue,
                        "&.Mui-checked": {
                          color: (t) => t.palette.custom.pink,
                        },
                      }}
                    />
                  }
                  label="I agree to be contacted when CareSeeker goes live"
                  sx={{
                    mt: 0.4,
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.95rem",
                      color: "text.secondary",
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canSubmit}
                  sx={{
                    mt: { xs: 0.45, md: 0.15 },
                    py: { xs: 1.2, md: 0.95 },
                    borderRadius: 999,
                    textTransform: "none",
                    fontSize: { xs: "1rem", md: "0.96rem" },
                    fontWeight: 700,
                    color: "#fff",
                    textDecoration: "underline",
                    textUnderlineOffset: 4,
                    background:
                      "linear-gradient(90deg, #b89fc1 0%, #5ea6d4 100%)",
                    boxShadow: "0 12px 26px rgba(82, 126, 170, 0.26)",
                    transition:
                      "transform 240ms ease-in-out, box-shadow 240ms ease-in-out, color 240ms ease-in-out, background 240ms ease-in-out",
                    "&:hover": {
                      color: "#000",
                      textDecoration: "underline",
                      background:
                        "linear-gradient(90deg, #a489b0 0%, #4b94c3 100%)",
                      transform: "scale(1.02)",
                      boxShadow: "0 14px 28px rgba(54, 99, 148, 0.28)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(255,255,255,0.8)",
                      background:
                        "linear-gradient(90deg, rgba(184,159,193,0.7) 0%, rgba(94,166,212,0.7) 100%)",
                    },
                  }}
                >
                  Join Provider Waitlist
                </Button>
              </Stack>

              <Typography
                sx={{
                  mt: { xs: 2.2, md: 1.2 },
                  fontSize: { xs: "0.85rem", md: "0.8rem" },
                  color: "text.secondary",
                }}
              >
                Looking for care?{" "}
                <Box
                  component={RouterLink}
                  to={BASE_ROUTE_PATHS[BaseRoute.GetCare]}
                  sx={{
                    color: (t) => t.palette.custom.blue,
                    fontWeight: 700,
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                    "&:hover": {
                      color: "#000",
                    },
                  }}
                >
                  Join as a Care Seeker
                </Box>
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                position: "relative",
                height: "100%",
                minHeight: { xs: 360, sm: 430, md: 0 },
                maxHeight: { md: "90vh" },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: { xs: 4, md: 6 },
                  overflow: "hidden",
                  boxShadow: "0 22px 44px rgba(20, 44, 81, 0.17)",
                }}
              >
                <Box
                  component="img"
                  src={providerWaitlistHeroImage}
                  alt="Care provider supporting an older adult"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(13,24,48,0.04) 0%, rgba(16,28,54,0.24) 100%)",
                  }}
                />
              </Box>

              <Paper
                elevation={0}
                sx={{
                  position: "absolute",
                  top: { xs: 16, md: 22 },
                  left: { xs: 16, md: 22 },
                  px: 1.4,
                  py: 0.6,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.86)",
                  color: (t) => t.palette.custom.blue,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  backdropFilter: "blur(3px)",
                }}
              >
                Provider Early Access
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GiveCare;
