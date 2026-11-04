import { Step, StepLabel, Stepper } from "@mui/material";
import { PROVIDER_REGISTER_STEPS, type ProviderRegisterStep } from "../types";

type ProviderRegisterStepperProps = {
  activeStep: ProviderRegisterStep;
};

const ProviderRegisterStepper = ({
  activeStep,
}: ProviderRegisterStepperProps) => {
  const activeIndex = PROVIDER_REGISTER_STEPS.findIndex(
    (step) => step.key === activeStep,
  );

  return (
    <Stepper
      activeStep={activeIndex}
      alternativeLabel
      aria-label={`Step ${activeIndex + 1} of ${PROVIDER_REGISTER_STEPS.length}`}
      sx={{ "& .MuiStepLabel-label": { fontSize: { xs: 12, sm: 14 } } }}
    >
      {PROVIDER_REGISTER_STEPS.map((step) => (
        <Step key={step.key}>
          <StepLabel>{step.label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default ProviderRegisterStepper;
