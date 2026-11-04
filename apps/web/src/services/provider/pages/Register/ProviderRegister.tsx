import { useState } from "react";
import { Button, CircularProgress, Stack } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../../routes/enums";
import {
  ProviderAuthApiError,
  useCompleteProviderOnboardingMutation,
  useProviderOnboardingQuery,
  useProviderServiceProfileQuery,
  useProviderWorkPreferencesQuery,
  useRegisterProviderMutation,
  useSaveProviderServiceProfileMutation,
  useSaveProviderWorkPreferencesMutation,
  useSignInProviderMutation,
  type ProviderServiceProfilePayload,
  type ProviderWorkPreferencesPayload,
} from "../../../../queries/provider";
import { ProviderAuthLoadingScreen, useProviderAuth } from "../../auth";
import ProviderAuthLayout from "../../components/ProviderAuthLayout";
import ProviderRegisterStepper from "./components/ProviderRegisterStepper";
import ProviderDocumentsStep from "./steps/ProviderDocumentsStep";
import ProviderPersonalInfoStep from "./steps/ProviderPersonalInfoStep";
import ProviderServicesJobsStep from "./steps/ProviderServicesJobsStep";
import ProviderWorkPreferencesStep from "./steps/ProviderWorkPreferencesStep";
import {
  EMPTY_PROVIDER_PERSONAL_INFO,
  EMPTY_PROVIDER_SERVICES_JOBS,
  EMPTY_PROVIDER_WORK_PREFERENCES,
  formatTime,
  servicesJobsFormFromProfile,
  workPreferencesFormFromSaved,
  type ProviderPersonalInfoForm,
  type ProviderRegisterStep,
  type ProviderServicesJobsForm,
  type ProviderWorkPreferencesForm,
} from "./types";
import {
  DATE_OF_BIRTH_FORMAT,
  dollarsToCents,
  normalizeUsPhone,
} from "./validation";

const stepCopy: Record<
  ProviderRegisterStep,
  { title: string; description: string }
> = {
  "personal-info": {
    title: "Create your provider account",
    description:
      "Tell us a bit about yourself so care seekers know who they are working with.",
  },
  "services-jobs": {
    title: "Your services & job interests",
    description:
      "What you offer, what you are good at, and the work you are looking for.",
  },
  documents: {
    title: "Supporting documents",
    description:
      "Upload your CV, references, certificates and licenses. Each file is checked and stored privately.",
  },
  availability: {
    title: "Availability & work preferences",
    description:
      "When, where and under which conditions you want to work. You can change this later in your account settings.",
  },
};

const resumeCopy = {
  title: "Finish setting up your profile",
  description:
    "Your account is ready. Tell us about your services and the work you are looking for to start receiving requests.",
};

const toServiceProfilePayload = (
  form: ProviderServicesJobsForm,
): ProviderServiceProfilePayload => ({
  careServices: form.careServices,
  otherCareService: form.otherCareService.trim(),
  skills: form.skills,
  otherSkill: form.otherSkill.trim(),
  yearsOfExperience: Number(form.yearsOfExperience),
  previousCareExperience: form.previousCareExperience.trim(),
  qualifications: form.qualifications,
  otherQualification: form.otherQualification.trim(),
  languages: form.languages,
  otherLanguage: form.otherLanguage.trim(),
  coverLetter: form.coverLetter.trim(),
  jobCategories: form.jobCategories,
  tasksWilling: form.tasksWilling,
  tasksUnwilling: form.tasksUnwilling,
  clientGroups: form.clientGroups,
});

const toWorkPreferencesPayload = (
  form: ProviderWorkPreferencesForm,
): ProviderWorkPreferencesPayload => ({
  workingDays: Object.entries(form.days)
    .filter(([, day]) => day.enabled)
    .map(([day, schedule]) => ({
      dayOfWeek: Number(day),
      mode: schedule.mode,
      windows:
        schedule.mode === "all_day"
          ? []
          : schedule.windows.map((window) => ({
              // Validated by the step before submit.
              start: window.start ? formatTime(window.start) : "",
              end: window.end ? formatTime(window.end) : "",
              endsNextDay: window.endsNextDay,
            })),
    })),
  workType: form.workType as ProviderWorkPreferencesPayload["workType"],
  availabilityStart: form.availabilityStart,
  availableFrom:
    form.availabilityStart === "specific_date"
      ? (form.availableFrom?.format(DATE_OF_BIRTH_FORMAT) ?? null)
      : null,
  acceptsHourly: form.acceptsHourly,
  acceptsFixedPrice: form.acceptsFixedPrice,
  acceptsOneTimeJobs: form.acceptsOneTimeJobs,
  acceptsDailyJobs: form.acceptsDailyJobs,
  acceptsWeeklyJobs: form.acceptsWeeklyJobs,
  acceptsMonthlyJobs: form.acceptsMonthlyJobs,
  availableOvernight: form.availableOvernight,
  availableLiveIn: form.availableLiveIn,
  availableEmergency: form.availableEmergency,
  maxTravelDistanceMiles: form.maxTravelDistanceMiles,
  offersTransportation: form.offersTransportation,
  vehicleType: form.offersTransportation
    ? (form.vehicleType as ProviderWorkPreferencesPayload["vehicleType"])
    : null,
  vehicleWheelchairAccessible: form.offersTransportation
    ? form.vehicleWheelchairAccessible
    : null,
  minWeeklyHours: Number(form.minWeeklyHours),
  maxWeeklyHours: Number(form.maxWeeklyHours),
  preferredHourlyRateCents: dollarsToCents(form.preferredHourlyRate) ?? 0,
  minHourlyRateCents: dollarsToCents(form.minHourlyRate) ?? 0,
  matchingNotes: form.matchingNotes.trim() || null,
});

/**
 * Provider onboarding.
 *
 * - Steps 1 and 2 are filled in locally with back / continue; nothing is
 *   persisted until step 2 is submitted, which creates the account, signs in
 *   and saves the services profile.
 * - Steps 3 (documents) and 4 (availability & preferences) run signed in.
 *   Uploads persist immediately; step 4 is saved on "Finish", which also marks
 *   onboarding as completed on the server and leads to the profile overview
 *   for a final review. Going back re-saves on continue.
 * - A signed-in provider who has not finished (refresh, closed tab, failed
 *   save) lands here again at the first unfinished step, with steps 2 and 4
 *   prefilled from the server. Once completed, `/register` redirects to the
 *   dashboard; later edits happen in account settings.
 */
const ProviderRegisterPage = () => {
  const navigate = useNavigate();
  const {
    initialized,
    providerUser,
    accessDeniedMessage,
    clearAccessDeniedMessage,
    verifyProviderGateFromSession,
  } = useProviderAuth();
  const registerMutation = useRegisterProviderMutation();
  const signInMutation = useSignInProviderMutation();
  const saveServiceProfileMutation = useSaveProviderServiceProfileMutation();
  const saveWorkPreferencesMutation = useSaveProviderWorkPreferencesMutation();
  const completeOnboardingMutation = useCompleteProviderOnboardingMutation();

  /** `null` until the user navigates: the initial step is derived below. */
  const [step, setStep] = useState<ProviderRegisterStep | null>(null);
  const [personalInfo, setPersonalInfo] = useState<ProviderPersonalInfoForm>(
    EMPTY_PROVIDER_PERSONAL_INFO,
  );
  /** `null` until edited: starts from the saved profile when resuming. */
  const [servicesJobsEdits, setServicesJobsEdits] =
    useState<ProviderServicesJobsForm | null>(null);
  const [workPreferencesEdits, setWorkPreferencesEdits] =
    useState<ProviderWorkPreferencesForm | null>(null);
  const [personalInfoError, setPersonalInfoError] = useState<string | null>(
    null,
  );
  const [servicesJobsError, setServicesJobsError] = useState<string | null>(
    null,
  );
  const [finishError, setFinishError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  // A signed-in provider arriving here (refresh, closed tab, failed save) is
  // placed at the first unfinished step, or sent to the dashboard when done.
  // Not the case while this very flow is creating the account.
  const resumingSession = Boolean(providerUser) && !accountCreated;
  const onboardingQuery = useProviderOnboardingQuery({
    enabled: resumingSession,
  });
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = onboardingQuery;
  const resumed =
    resumingSession && Boolean(queryData) && !queryData?.completedAt;

  // Step 2 stays editable after resuming, so start it from what was saved.
  const serviceProfileQuery = useProviderServiceProfileQuery({
    enabled: resumed && Boolean(queryData?.serviceProfile),
  });
  const { data: serviceProfileData } = serviceProfileQuery;
  const servicesJobs: ProviderServicesJobsForm =
    servicesJobsEdits ??
    (serviceProfileData?.profile
      ? servicesJobsFormFromProfile(serviceProfileData.profile)
      : EMPTY_PROVIDER_SERVICES_JOBS);

  /** The account exists: created by this flow, or signed in and resumed. */
  const accountReady = accountCreated || resumed;

  // Step 4 is always signed in; load what was saved (resume / back & forth).
  const workPreferencesQuery = useProviderWorkPreferencesQuery({
    enabled: accountReady,
  });
  const {
    data: workPreferencesData,
    isLoading: isLoadingWorkPreferences,
    isError: isErrorWorkPreferences,
  } = workPreferencesQuery;
  const workPreferences: ProviderWorkPreferencesForm =
    workPreferencesEdits ??
    (workPreferencesData?.preferences
      ? workPreferencesFormFromSaved(workPreferencesData.preferences)
      : EMPTY_PROVIDER_WORK_PREFERENCES);

  // Resume at the first unfinished step. Documents are optional, so a
  // provider without any is shown step 3 first; one who already uploaded
  // has seen it and goes straight to step 4.
  const resumeStep = (): ProviderRegisterStep => {
    if (!queryData?.serviceProfile) return "services-jobs";
    if (!queryData.workPreferences && queryData.documentsCount === 0) {
      return "documents";
    }
    return "availability";
  };
  const activeStep: ProviderRegisterStep =
    step ?? (resumed ? resumeStep() : "personal-info");

  const submitting =
    registerMutation.isPending ||
    signInMutation.isPending ||
    saveServiceProfileMutation.isPending ||
    saveWorkPreferencesMutation.isPending ||
    completeOnboardingMutation.isPending;

  if (!initialized || (resumingSession && isLoadingQuery)) {
    return <ProviderAuthLoadingScreen />;
  }

  // Only a confirmed completion leaves the flow; a failed status check must
  // not be mistaken for "done" (it would hide an unfinished onboarding).
  if (resumingSession && queryData?.completedAt) {
    return (
      <Navigate to={PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard]} replace />
    );
  }

  if (resumingSession && isErrorQuery) {
    return (
      <ProviderAuthLayout
        title="Let’s pick up where you left off"
        description="We could not check how far you got with your registration."
        footerMode="register"
        maxWidth={680}
        showAuthFooter={false}
        formError={
          onboardingQuery.error?.message ??
          "Could not load your onboarding status."
        }
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            onClick={() => void onboardingQuery.refetch()}
            disabled={onboardingQuery.isFetching}
            startIcon={
              onboardingQuery.isFetching ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
          >
            Try again
          </Button>
          <Button
            variant="text"
            onClick={() =>
              navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard])
            }
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
          >
            Go to dashboard
          </Button>
        </Stack>
      </ProviderAuthLayout>
    );
  }

  const handlePersonalInfoContinue = () => {
    setPersonalInfoError(null);
    setStep("services-jobs");
  };

  const handleBack = () => {
    setServicesJobsError(null);
    setStep("personal-info");
  };

  /** Step 1 data → account. Returns `false` (and shows step 1) on failure. */
  const createAccount = async (): Promise<boolean> => {
    const email = personalInfo.email.trim().toLowerCase();

    try {
      await registerMutation.mutateAsync({
        // Validated by the step before continuing; the API enforces it all again.
        name: personalInfo.name.trim(),
        surname: personalInfo.surname.trim(),
        dateOfBirth:
          personalInfo.dateOfBirth?.format(DATE_OF_BIRTH_FORMAT) ?? "",
        gender: personalInfo.gender,
        email,
        password: personalInfo.password,
        phone: normalizeUsPhone(personalInfo.phone) ?? personalInfo.phone,
        addressLine1: personalInfo.addressLine1.trim(),
        city: personalInfo.city.trim(),
        state: personalInfo.state,
        postalCode: personalInfo.postalCode.trim(),
        profilePicture: personalInfo.profilePicture as File,
      });
    } catch (error) {
      const duplicate =
        error instanceof ProviderAuthApiError &&
        error.code === "DUPLICATE_EMAIL";
      setIsDuplicateEmail(duplicate);
      setPersonalInfoError(
        error instanceof Error
          ? error.message
          : "Could not create your account. Please try again.",
      );
      setStep("personal-info");
      return false;
    }

    setAccountCreated(true);

    try {
      await signInMutation.mutateAsync({
        email,
        password: personalInfo.password,
      });
    } catch {
      setStatusMessage(
        "Your account was created. Please sign in to finish setting up your profile.",
      );
      return false;
    }

    const outcome = await verifyProviderGateFromSession();
    if (outcome !== "provider") {
      setServicesJobsError(
        "Your account was created, but we could not verify the session. Please sign in and finish your profile.",
      );
      navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Login], { replace: true });
      return false;
    }

    return true;
  };

  const handleServicesJobsSubmit = async () => {
    setServicesJobsError(null);
    setStatusMessage(null);
    setIsDuplicateEmail(false);
    clearAccessDeniedMessage();

    if (!accountReady) {
      const created = await createAccount();
      if (!created) return;
    }

    try {
      await saveServiceProfileMutation.mutateAsync(
        toServiceProfilePayload(servicesJobs),
      );
    } catch (error) {
      setServicesJobsError(
        error instanceof Error
          ? error.message
          : "Could not save your services and job interests. Please try again.",
      );
      return;
    }

    setStep("documents");
  };

  const handleDocumentsBack = () => setStep("services-jobs");
  const handleDocumentsContinue = () => setStep("availability");
  const handleAvailabilityBack = () => setStep("documents");

  /** Saves step 4, then marks onboarding complete. */
  const handleFinish = async () => {
    setFinishError(null);

    try {
      await saveWorkPreferencesMutation.mutateAsync(
        toWorkPreferencesPayload(workPreferences),
      );
      await completeOnboardingMutation.mutateAsync();
    } catch (error) {
      setFinishError(
        error instanceof Error
          ? error.message
          : "Could not finish your onboarding. Please try again.",
      );
      return;
    }

    // Review everything once before the dashboard becomes home.
    navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Overview], { replace: true });
  };

  const copy =
    resumed && activeStep === "services-jobs" && !queryData?.serviceProfile
      ? resumeCopy
      : stepCopy[activeStep];

  return (
    <ProviderAuthLayout
      title={copy.title}
      description={copy.description}
      footerMode="register"
      maxWidth={680}
      statusMessage={statusMessage}
      formError={accessDeniedMessage}
      showAuthFooter={!accountReady}
    >
      <ProviderRegisterStepper activeStep={activeStep} />

      {activeStep === "personal-info" ? (
        <ProviderPersonalInfoStep
          value={personalInfo}
          onChange={setPersonalInfo}
          onSubmit={handlePersonalInfoContinue}
          submitting={submitting}
          isDuplicateEmail={isDuplicateEmail}
          error={personalInfoError}
        />
      ) : null}

      {activeStep === "services-jobs" ? (
        <ProviderServicesJobsStep
          value={servicesJobs}
          onChange={setServicesJobsEdits}
          onSubmit={handleServicesJobsSubmit}
          onBack={accountReady ? undefined : handleBack}
          submitting={submitting}
          submitLabel={accountReady ? "Save and continue" : "Create account"}
          error={servicesJobsError}
        />
      ) : null}

      {activeStep === "documents" ? (
        <ProviderDocumentsStep
          onBack={handleDocumentsBack}
          onContinue={handleDocumentsContinue}
        />
      ) : null}

      {activeStep === "availability" ? (
        <ProviderWorkPreferencesStep
          value={workPreferences}
          onChange={setWorkPreferencesEdits}
          onSubmit={handleFinish}
          onBack={handleAvailabilityBack}
          submitting={submitting}
          submitLabel="Finish"
          loading={isLoadingWorkPreferences}
          loadError={
            isErrorWorkPreferences
              ? (workPreferencesQuery.error?.message ??
                "Could not load your saved availability.")
              : null
          }
          onRetryLoad={() => void workPreferencesQuery.refetch()}
          retryingLoad={workPreferencesQuery.isFetching}
          error={finishError}
        />
      ) : null}
    </ProviderAuthLayout>
  );
};

export default ProviderRegisterPage;
