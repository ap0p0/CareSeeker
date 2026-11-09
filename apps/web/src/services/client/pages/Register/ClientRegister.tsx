import { useState } from "react";
import { Button, CircularProgress, Stack } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../routes/enums";
import {
  ClientAuthApiError,
  useCarePreferencesQuery,
  useCareRecipientQuery,
  useCompleteSeekerOnboardingMutation,
  useRegisterSeekerMutation,
  useRegisterSeekerOnBehalfMutation,
  useSaveCarePreferencesMutation,
  useSaveCareRecipientMutation,
  useSeekerRegistrantQuery,
  useSignInClientMutation,
  useUpdateSeekerRegistrantMutation,
  useUpdateSeekersInfoMutation,
} from "../../../../queries/client";
import { normalizeUsPhone } from "../../../../utils/usPhone";
import { ClientAuthLoadingScreen, useClientAuth } from "../../auth";
import ClientAuthLayout from "../../components/ClientAuthLayout";
import {
  carePreferencesFormFromSaved,
  hasSuggestions,
  suggestCarePreferences,
  toCarePreferencesPayload,
  type CarePreferencesForm,
} from "./carePreferencesForm";
import OnBehalfRegisterStepper from "./components/OnBehalfRegisterStepper";
import CareForStep from "./steps/CareForStep";
import CareNeedsStep from "./steps/CareNeedsStep";
import RecipientPersonalInfoStep from "./steps/RecipientPersonalInfoStep";
import RegistrantInfoStep from "./steps/RegistrantInfoStep";
import SeekerAboutYouStep from "./steps/SeekerAboutYouStep";
import SeekerCreateAccountStep from "./steps/SeekerCreateAccountStep";
import SeekerMedicalHistoryStep from "./steps/SeekerMedicalHistoryStep";
import SeekerSetupCompleteStep from "./steps/SeekerSetupCompleteStep";
import {
  EMPTY_CARE_RECIPIENT,
  EMPTY_REGISTRANT_INFO,
  EMPTY_SEEKER_ABOUT_YOU,
  EMPTY_SEEKER_CREATE_ACCOUNT,
  EMPTY_SEEKER_MEDICAL_HISTORY,
  careRecipientFormFromSaved,
  isOnBehalfRegisterStep,
  registrantFormFromSaved,
  toCareRecipientPayload,
  toRegistrantUpdatePayload,
  type CareForChoice,
  type CareRecipientForm,
  type RegisterStep,
  type RegistrantInfoForm,
  type SeekerAboutYouForm,
  type SeekerCreateAccountForm,
  type SeekerMedicalHistory,
} from "./types";

/** The on-behalf steps use two-column rows, so they get a wider card. */
const ON_BEHALF_CARD_WIDTH = 640;

const stepCopy: Record<RegisterStep, { title: string; description: string }> = {
  "care-for": {
    title: "Who needs care?",
    description:
      "Are you looking for care for yourself, or for a family member or friend?",
  },
  "seeker-create-account": {
    title: "Create your account",
    description:
      "Start with your basic details. We’ll use these to set up your profile.",
  },
  "seeker-about-you": {
    title: "Tell us more about you",
    description:
      "A few personal details help us match you with the right care.",
  },
  "seeker-medical-history": {
    title: "Care & health details",
    description:
      "Tell us about medical support needs and the kinds of help you will request.",
  },
  "seeker-setup-complete": {
    title: "Thank you for sharing your info.",
    description: "Your account is being created.",
  },
  "registrant-info": {
    title: "Tell us about yourself",
    description:
      "First, a few details about you — the person opening the account and arranging care for someone you love.",
  },
  "care-needs": {
    title: "Care needs & preferences",
    description:
      "A one-time visit or ongoing care? Tell us what help is needed, when, and what matters in a caregiver.",
  },
  "recipient-personal-info": {
    title: "Who are you helping?",
    description:
      "Tell us about the person who needs care, so we can find a caregiver who fits them.",
  },
};

/**
 * Care seeker registration.
 *
 * - "For myself": create account → about you → care & health.
 * - "Family member or friend" (on behalf of someone else): step 1 collects
 *   the registrant and creates the account; step 2 describes the person who
 *   needs care; step 3 their care needs & assistance preferences (pre-filled
 *   from step 2 until saved). Users move back and forth freely: once the
 *   account exists, step 1 is edited in place and each step is saved again
 *   on continue.
 * - Saving step 3 finishes the registration and opens the one-time review
 *   page (`/register/review`), where everything can still be edited before
 *   confirming.
 * - A signed-in seeker arriving here with an unfinished on-behalf
 *   registration (refresh, closed tab, failed save) resumes at the first
 *   unfinished step with everything prefilled from the server; anyone else
 *   is sent to the dashboard (whose gate opens the review page while the
 *   registration is finished but not yet confirmed).
 */
const ClientRegisterPage = () => {
  const navigate = useNavigate();
  const {
    initialized,
    seekerUser,
    clearAccessDeniedMessage,
    verifySeekerGateFromSession,
  } = useClientAuth();
  const registerMutation = useRegisterSeekerMutation();
  const registerOnBehalfMutation = useRegisterSeekerOnBehalfMutation();
  const signInMutation = useSignInClientMutation();
  const updateSeekersInfoMutation = useUpdateSeekersInfoMutation();
  const updateRegistrantMutation = useUpdateSeekerRegistrantMutation();
  const saveCareRecipientMutation = useSaveCareRecipientMutation();
  const saveCarePreferencesMutation = useSaveCarePreferencesMutation();
  const completeOnboardingMutation = useCompleteSeekerOnboardingMutation();

  /** `null` until the user navigates: the initial step is derived below. */
  const [stepState, setStep] = useState<RegisterStep | null>(null);
  const [careForState, setCareFor] = useState<CareForChoice | null>(null);
  const [accountForm, setAccountForm] = useState<SeekerCreateAccountForm>(
    EMPTY_SEEKER_CREATE_ACCOUNT,
  );
  const [aboutYouForm, setAboutYouForm] = useState<SeekerAboutYouForm>(
    EMPTY_SEEKER_ABOUT_YOU,
  );
  const [medicalHistory, setMedicalHistory] = useState<SeekerMedicalHistory>(
    EMPTY_SEEKER_MEDICAL_HISTORY,
  );
  /** `null` until edited: starts from the saved data when resuming. */
  const [registrantEdits, setRegistrantEdits] =
    useState<RegistrantInfoForm | null>(null);
  const [recipientEdits, setRecipientEdits] =
    useState<CareRecipientForm | null>(null);
  const [carePreferencesEdits, setCarePreferencesEdits] =
    useState<CarePreferencesForm | null>(null);
  const [registrantError, setRegistrantError] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [carePreferencesError, setCarePreferencesError] = useState<
    string | null
  >(null);
  const [isRegistrantDuplicateEmail, setIsRegistrantDuplicateEmail] =
    useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [aboutYouError, setAboutYouError] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  // Signed-in seekers may be in the middle of an on-behalf registration.
  // Never checked while this page runs the self-registration flow.
  const checkOnBehalf = Boolean(seekerUser) && careForState !== "self";
  const registrantQuery = useSeekerRegistrantQuery({ enabled: checkOnBehalf });
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = registrantQuery;
  const careRecipientQuery = useCareRecipientQuery({
    enabled: checkOnBehalf && Boolean(queryData),
  });
  const {
    data: careRecipientData,
    isLoading: isLoadingCareRecipient,
    isError: isErrorCareRecipient,
  } = careRecipientQuery;
  const carePreferencesQuery = useCarePreferencesQuery({
    enabled: checkOnBehalf && Boolean(queryData),
  });
  const {
    data: carePreferencesData,
    isLoading: isLoadingCarePreferences,
    isError: isErrorCarePreferences,
  } = carePreferencesQuery;

  /** Arrived signed in and has not navigated yet. */
  const arrivedSignedIn = Boolean(seekerUser) && stepState === null;
  /** First unfinished on-behalf step, or `null` when all are saved. */
  const resumeStep: RegisterStep | null =
    !queryData || !careRecipientData || !carePreferencesData
      ? null
      : !careRecipientData.completed
        ? "recipient-personal-info"
        : !carePreferencesData.completed
          ? "care-needs"
          : null;
  const resumed = arrivedSignedIn && resumeStep !== null;

  const step: RegisterStep =
    stepState ?? (resumed && resumeStep ? resumeStep : "care-for");
  const careFor: CareForChoice | null =
    careForState ?? (queryData ? "other" : null);

  /** The on-behalf account exists: created here, or found on the server. */
  const accountReady = accountCreated || Boolean(queryData);

  const registrantForm: RegistrantInfoForm =
    registrantEdits ??
    (queryData ? registrantFormFromSaved(queryData) : EMPTY_REGISTRANT_INFO);
  const recipientForm: CareRecipientForm =
    recipientEdits ??
    (careRecipientData?.careRecipient
      ? careRecipientFormFromSaved(careRecipientData.careRecipient)
      : EMPTY_CARE_RECIPIENT);
  // Until step 3 is saved or edited, start it from what step 2 says.
  const carePreferencesSaved = carePreferencesData?.preferences ?? null;
  const carePreferencesForm: CarePreferencesForm =
    carePreferencesEdits ??
    (carePreferencesSaved
      ? carePreferencesFormFromSaved(carePreferencesSaved)
      : suggestCarePreferences(recipientForm));
  const carePreferencesPrefilled =
    !carePreferencesEdits &&
    !carePreferencesSaved &&
    hasSuggestions(carePreferencesForm);

  const submitting =
    registerMutation.isPending ||
    registerOnBehalfMutation.isPending ||
    signInMutation.isPending ||
    updateRegistrantMutation.isPending;

  if (
    !initialized ||
    (arrivedSignedIn &&
      (isLoadingQuery ||
        (Boolean(queryData) &&
          (isLoadingCareRecipient || isLoadingCarePreferences))))
  ) {
    return <ClientAuthLoadingScreen />;
  }

  if (
    arrivedSignedIn &&
    (isErrorQuery || isErrorCareRecipient || isErrorCarePreferences)
  ) {
    const failed = isErrorQuery
      ? registrantQuery
      : isErrorCareRecipient
        ? careRecipientQuery
        : carePreferencesQuery;

    return (
      <ClientAuthLayout
        title="Let’s pick up where you left off"
        description="We could not check how far you got with your registration."
        footerMode="register"
        showAuthFooter={false}
        formError={
          failed.error?.message ?? "Could not load your registration status."
        }
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            onClick={() => void failed.refetch()}
            disabled={failed.isFetching}
            startIcon={
              failed.isFetching ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
          >
            Try again
          </Button>
          <Button
            variant="text"
            onClick={() => navigate(SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard])}
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
          >
            Go to dashboard
          </Button>
        </Stack>
      </ClientAuthLayout>
    );
  }

  // Signed-in users with nothing left to fill in go to the dashboard.
  if (arrivedSignedIn && !resumed) {
    return <Navigate to={SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard]} replace />;
  }

  const handleCareForSelect = (choice: CareForChoice) => {
    setCareFor(choice);
    setStep(choice === "self" ? "seeker-create-account" : "registrant-info");
  };

  const handleBack = () => {
    if (step === "seeker-create-account" || step === "registrant-info") {
      setStep("care-for");
      return;
    }

    if (step === "recipient-personal-info") {
      setRecipientError(null);
      setStep("registrant-info");
      return;
    }

    if (step === "care-needs") {
      setCarePreferencesError(null);
      setStep("recipient-personal-info");
      return;
    }

    if (step === "seeker-medical-history") {
      setStep("seeker-about-you");
    }
  };

  const handleCreateAccount = async () => {
    setFormError(null);
    setIsDuplicateEmail(false);
    clearAccessDeniedMessage();

    try {
      await registerMutation.mutateAsync({
        name: accountForm.name.trim(),
        surname: accountForm.surname.trim(),
        email: accountForm.email.trim(),
        password: accountForm.password,
      });

      try {
        await signInMutation.mutateAsync({
          email: accountForm.email.trim(),
          password: accountForm.password,
        });
      } catch {
        setFormError("Your account was created. Please sign in to continue.");
        return;
      }

      const outcome = await verifySeekerGateFromSession();

      if (outcome === "seeker") {
        setAccountCreated(true);
        setStep("seeker-about-you");
        return;
      }

      setFormError(
        "Your account was created, but we could not verify the session. Please sign in.",
      );
    } catch (error) {
      if (error instanceof ClientAuthApiError) {
        setIsDuplicateEmail(error.code === "DUPLICATE_EMAIL");
        setFormError(error.message);
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      }
    }
  };

  /**
   * On-behalf step 1: creates the account from the registrant's details,
   * signs in and verifies the seeker gate before moving on to the care
   * recipient steps (which run authenticated).
   */
  const handleCreateRegistrantAccount = async () => {
    setRegistrantError(null);
    setIsRegistrantDuplicateEmail(false);
    clearAccessDeniedMessage();

    const email = registrantForm.email.trim().toLowerCase();

    try {
      await registerOnBehalfMutation.mutateAsync({
        // Validated by the step before submitting; the API enforces it all again.
        name: registrantForm.name.trim(),
        surname: registrantForm.surname.trim(),
        email,
        password: registrantForm.password,
        phone: normalizeUsPhone(registrantForm.phone) ?? registrantForm.phone,
        relationship: registrantForm.relationship || "other",
        ...(registrantForm.relationship === "other"
          ? { relationshipOther: registrantForm.relationshipOther.trim() }
          : {}),
        consentToActOnBehalf: true,
      });
    } catch (error) {
      if (error instanceof ClientAuthApiError) {
        setIsRegistrantDuplicateEmail(error.code === "DUPLICATE_EMAIL");
        setRegistrantError(error.message);
        return;
      }

      setRegistrantError(
        error instanceof Error
          ? error.message
          : "Could not create your account. Please try again.",
      );
      return;
    }

    try {
      await signInMutation.mutateAsync({
        email,
        password: registrantForm.password,
      });
    } catch {
      setRegistrantError(
        "Your account was created. Please sign in to continue.",
      );
      return;
    }

    const outcome = await verifySeekerGateFromSession();

    if (outcome === "seeker") {
      setAccountCreated(true);
      setStep("recipient-personal-info");
      return;
    }

    setRegistrantError(
      "Your account was created, but we could not verify the session. Please sign in.",
    );
  };

  /** Step 1 once the account exists (going back): save edits, move on. */
  const handleUpdateRegistrant = async () => {
    setRegistrantError(null);

    try {
      await updateRegistrantMutation.mutateAsync(
        toRegistrantUpdatePayload(registrantForm),
      );
    } catch (error) {
      setRegistrantError(
        error instanceof Error
          ? error.message
          : "Could not save your details. Please try again.",
      );
      return;
    }

    setStep("recipient-personal-info");
  };

  const handleRegistrantSubmit = () =>
    accountReady ? handleUpdateRegistrant() : handleCreateRegistrantAccount();

  /** Step 2: the person who needs care. */
  const handleSaveRecipient = async () => {
    setRecipientError(null);

    try {
      await saveCareRecipientMutation.mutateAsync(
        toCareRecipientPayload(recipientForm),
      );
    } catch (error) {
      setRecipientError(
        error instanceof Error
          ? error.message
          : "Could not save these details. Please try again.",
      );
      return;
    }

    setStep("care-needs");
  };

  /**
   * Step 3: care needs & assistance preferences — the last step. Saving it
   * marks the registration as finished and opens the review page.
   */
  const handleSaveCarePreferences = async () => {
    setCarePreferencesError(null);

    try {
      await saveCarePreferencesMutation.mutateAsync(
        toCarePreferencesPayload(carePreferencesForm),
      );
      await completeOnboardingMutation.mutateAsync();
    } catch (error) {
      setCarePreferencesError(
        error instanceof Error
          ? error.message
          : "Could not save the care preferences. Please try again.",
      );
      return;
    }

    navigate(SEEKER_ROUTE_PATHS[SeekerRoute.RegistrationReview], {
      replace: true,
    });
  };

  const handleSaveAboutYou = async () => {
    setAboutYouError(null);

    try {
      await updateSeekersInfoMutation.mutateAsync({
        section: "about_you",
        age: Number(aboutYouForm.age),
        ethnicBackground: aboutYouForm.ethnicBackground,
        location: aboutYouForm.location.trim(),
        languagesSpoken: aboutYouForm.languagesSpoken,
        livingSituation: aboutYouForm.livingSituation,
        ...(aboutYouForm.livingSituation !== "live_alone" &&
        aboutYouForm.needsHelpBesidesHousehold
          ? {
              needsHelpBesidesHousehold:
                aboutYouForm.needsHelpBesidesHousehold as "yes" | "no",
            }
          : {}),
        preferredCaregiverGender: aboutYouForm.preferredCaregiverGender,
        preferredCaregiverLanguage: aboutYouForm.preferredCaregiverLanguage,
        culturalConsiderationsChoice: aboutYouForm.culturalConsiderationsChoice,
        culturalConsiderationsNotes:
          aboutYouForm.culturalConsiderationsNotes.trim(),
        scheduleVibe: aboutYouForm.scheduleVibe,
        homeAccessibility: aboutYouForm.homeAccessibility,
        careUrgency: aboutYouForm.careUrgency,
      });
      setStep("seeker-medical-history");
    } catch (error) {
      if (error instanceof Error) {
        setAboutYouError(error.message);
      }
    }
  };

  const handleSaveSeekersInfo = async () => {
    setInfoError(null);

    try {
      await updateSeekersInfoMutation.mutateAsync({
        section: "care_health",
        needsMedicalHelp: medicalHistory.needsMedicalHelp as "yes" | "no",
        healthNotesChoice: medicalHistory.healthNotesChoice,
        healthNotes: medicalHistory.healthNotes,
        medicationsChoice: medicalHistory.medicationsChoice,
        medicationsNotes: medicalHistory.medicationsNotes,
        basicCareNeeds: medicalHistory.basicCareNeeds,
        otherCareNeedDetails: medicalHistory.otherCareNeedDetails.trim(),
      });
      setStep("seeker-setup-complete");
    } catch (error) {
      if (error instanceof Error) {
        setInfoError(error.message);
      }
    }
  };

  const handleSetupCompleteRedirect = () => {
    navigate(SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard], { replace: true });
  };

  if (step === "seeker-setup-complete") {
    return <SeekerSetupCompleteStep onComplete={handleSetupCompleteRedirect} />;
  }

  const copy = stepCopy[step];
  // No way back to "Who needs care?" once an account exists.
  const showBack =
    step === "seeker-create-account" ||
    (step === "registrant-info" && !accountReady) ||
    step === "recipient-personal-info" ||
    step === "care-needs" ||
    step === "seeker-medical-history";
  const onBehalfStep = isOnBehalfRegisterStep(step) ? step : null;

  return (
    <ClientAuthLayout
      title={copy.title}
      description={copy.description}
      footerMode="register"
      showAuthFooter={step === "care-for"}
      onBack={showBack ? handleBack : undefined}
      maxWidth={onBehalfStep ? ON_BEHALF_CARD_WIDTH : undefined}
      header={
        onBehalfStep ? (
          <OnBehalfRegisterStepper activeStep={onBehalfStep} />
        ) : null
      }
    >
      {step === "care-for" ? (
        <CareForStep onSelect={handleCareForSelect} />
      ) : null}

      {step === "seeker-create-account" && careFor === "self" ? (
        <SeekerCreateAccountStep
          value={accountForm}
          onChange={setAccountForm}
          onSubmit={handleCreateAccount}
          submitting={submitting}
          isDuplicateEmail={
            isDuplicateEmail ||
            registerMutation.error?.code === "DUPLICATE_EMAIL"
          }
          error={
            formError ??
            registerMutation.error?.message ??
            signInMutation.error?.message ??
            null
          }
        />
      ) : null}

      {step === "seeker-about-you" && careFor === "self" ? (
        <SeekerAboutYouStep
          value={aboutYouForm}
          onChange={setAboutYouForm}
          onContinue={handleSaveAboutYou}
          submitting={updateSeekersInfoMutation.isPending}
          error={
            aboutYouError ?? updateSeekersInfoMutation.error?.message ?? null
          }
        />
      ) : null}

      {step === "seeker-medical-history" && careFor === "self" ? (
        <SeekerMedicalHistoryStep
          value={medicalHistory}
          onChange={setMedicalHistory}
          onContinue={handleSaveSeekersInfo}
          submitting={updateSeekersInfoMutation.isPending}
          error={infoError ?? updateSeekersInfoMutation.error?.message ?? null}
        />
      ) : null}

      {step === "registrant-info" && careFor === "other" ? (
        <RegistrantInfoStep
          value={registrantForm}
          onChange={setRegistrantEdits}
          onSubmit={handleRegistrantSubmit}
          submitting={submitting}
          isDuplicateEmail={isRegistrantDuplicateEmail}
          error={registrantError}
          mode={accountReady ? "edit" : "register"}
        />
      ) : null}

      {step === "recipient-personal-info" && careFor === "other" ? (
        <RecipientPersonalInfoStep
          value={recipientForm}
          onChange={setRecipientEdits}
          onSubmit={handleSaveRecipient}
          submitting={saveCareRecipientMutation.isPending}
          error={recipientError}
        />
      ) : null}

      {step === "care-needs" && careFor === "other" ? (
        <CareNeedsStep
          value={carePreferencesForm}
          onChange={setCarePreferencesEdits}
          onSubmit={handleSaveCarePreferences}
          submitting={
            saveCarePreferencesMutation.isPending ||
            completeOnboardingMutation.isPending
          }
          error={carePreferencesError}
          recipientName={recipientForm.name}
          prefilled={carePreferencesPrefilled}
        />
      ) : null}
    </ClientAuthLayout>
  );
};

export default ClientRegisterPage;
