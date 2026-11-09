/**
 * Gender disclosure shared by provider onboarding (optional) and care
 * recipients (required, with "prefer not to say"). Mirrors the API `Gender`
 * enum (lower-cased on the wire).
 */
export type Gender = "female" | "male" | "non_binary" | "prefer_not_to_say";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];
