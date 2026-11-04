/**
 * Focuses and scrolls to the first invalid field of a step. Fields are
 * located by `name` (inputs), falling back to `data-field` (checkbox groups).
 * MUI `Select` keeps its `name` on a hidden input, so the visible combobox
 * next to it is focused instead.
 */
export const focusFirstInvalidField = (
  fieldOrder: readonly string[],
  errors: Partial<Record<string, string>>,
): void => {
  const firstInvalid = fieldOrder.find((field) => errors[field]);
  if (!firstInvalid || typeof document === "undefined") return;

  const input = document.querySelector<HTMLElement>(
    `[name="${firstInvalid}"], [data-field="${firstInvalid}"]`,
  );
  const element =
    input?.getAttribute("aria-hidden") === "true"
      ? (input.parentElement?.querySelector<HTMLElement>('[role="combobox"]') ??
        input)
      : input;

  element?.focus({ preventScroll: true });
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
};
