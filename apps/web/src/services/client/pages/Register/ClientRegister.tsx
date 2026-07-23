import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../routes/enums";
import {
  ClientAuthApiError,
  useRegisterSeekerMutation,
  useSignInClientMutation,
  useUpdateSeekersInfoMutation,
} from "../../../../queries/client";
import { ClientAuthLoadingScreen, useClientAuth } from "../../auth";
import ClientAuthLayout from "../../components/ClientAuthLayout";
import CareForStep from "./steps/CareForStep";
import RecipientPersonalInfoStep from "./steps/RecipientPersonalInfoStep";
import SeekerAboutYouStep from "./steps/SeekerAboutYouStep";
import SeekerCreateAccountStep from "./steps/SeekerCreateAccountStep";
import SeekerMedicalHistoryStep from "./steps/SeekerMedicalHistoryStep";
import SeekerSetupCompleteStep from "./steps/SeekerSetupCompleteStep";
import {
  EMPTY_SEEKER_ABOUT_YOU,
  EMPTY_SEEKER_CREATE_ACCOUNT,
  EMPTY_SEEKER_MEDICAL_HISTORY,
  type CareForChoice,
  type RegisterStep,
  type SeekerAboutYouForm,
  type SeekerCreateAccountForm,
  type SeekerMedicalHistory,
} from "./types";

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
  "recipient-personal-info": {
    title: "Who are you helping?",
    description:
      "Share a few details about the person you are seeking care for.",
  },
};

const ClientRegisterPage = () => {
  const navigate = useNavigate();
  const {
    initialized,
    seekerUser,
    clearAccessDeniedMessage,
    verifySeekerGateFromSession,
  } = useClientAuth();
  const registerMutation = useRegisterSeekerMutation();
  const signInMutation = useSignInClientMutation();
  const updateSeekersInfoMutation = useUpdateSeekersInfoMutation();

  const [step, setStep] = useState<RegisterStep>("care-for");
  const [careFor, setCareFor] = useState<CareForChoice | null>(null);
  const [accountForm, setAccountForm] = useState<SeekerCreateAccountForm>(
    EMPTY_SEEKER_CREATE_ACCOUNT,
  );
  const [aboutYouForm, setAboutYouForm] = useState<SeekerAboutYouForm>(
    EMPTY_SEEKER_ABOUT_YOU,
  );
  const [medicalHistory, setMedicalHistory] = useState<SeekerMedicalHistory>(
    EMPTY_SEEKER_MEDICAL_HISTORY,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [aboutYouError, setAboutYouError] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const submitting = registerMutation.isPending || signInMutation.isPending;

  if (!initialized) {
    return <ClientAuthLoadingScreen />;
  }

  // Logged-in users only leave register when they were not mid-onboarding.
  if (seekerUser && !accountCreated && step === "care-for") {
    return <Navigate to={SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard]} replace />;
  }

  const handleCareForSelect = (choice: CareForChoice) => {
    setCareFor(choice);
    setStep(
      choice === "self" ? "seeker-create-account" : "recipient-personal-info",
    );
  };

  const handleBack = () => {
    if (
      step === "seeker-create-account" ||
      step === "recipient-personal-info"
    ) {
      setStep("care-for");
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
  const showBack =
    step === "seeker-create-account" ||
    step === "recipient-personal-info" ||
    step === "seeker-medical-history";

  return (
    <ClientAuthLayout
      title={copy.title}
      description={copy.description}
      footerMode="register"
      showAuthFooter={step === "care-for"}
      onBack={showBack ? handleBack : undefined}
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

      {step === "recipient-personal-info" && careFor === "other" ? (
        <RecipientPersonalInfoStep />
      ) : null}
    </ClientAuthLayout>
  );
};

export default ClientRegisterPage;
