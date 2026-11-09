import { Step, StepLabel, Stepper } from "@mui/material";
import { ON_BEHALF_REGISTER_STEPS, type OnBehalfRegisterStep } from "../types";

type OnBehalfRegisterStepperProps = {
  activeStep: OnBehalfRegisterStep;
};

/** Progress indicator for the "care for someone else" registration. */
const OnBehalfRegisterStepper = ({
  activeStep,
}: OnBehalfRegisterStepperProps) => {
  const activeIndex = ON_BEHALF_REGISTER_STEPS.findIndex(
    (step) => step.key === activeStep,
  );

  return (
    <Stepper
      activeStep={activeIndex}
      alternativeLabel
      aria-label={`Step ${activeIndex + 1} of ${ON_BEHALF_REGISTER_STEPS.length}`}
      sx={{ "& .MuiStepLabel-label": { fontSize: { xs: 12, sm: 14 } } }}
    >
      {ON_BEHALF_REGISTER_STEPS.map((step) => (
        <Step key={step.key}>
          <StepLabel>{step.label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default OnBehalfRegisterStepper;
