import type { ProviderDocumentCategory } from "../../../../queries/provider";

export type DocumentCategoryOption = {
  value: ProviderDocumentCategory;
  label: string;
  description: string;
};

/** Upload sections of onboarding step 3, in display order. */
export const DOCUMENT_CATEGORY_OPTIONS: DocumentCategoryOption[] = [
  {
    value: "cv_resume",
    label: "CV / Resume",
    description: "Your most recent CV or resume.",
  },
  {
    value: "reference_letter",
    label: "Reference letters",
    description: "Letters from previous employers or families you cared for.",
  },
  {
    value: "educational_certificate",
    label: "Educational certificates",
    description: "Diplomas and degrees.",
  },
  {
    value: "professional_certificate",
    label: "Professional certificates",
    description: "CNA, HHA, CPR / first aid and other training certificates.",
  },
  {
    value: "medical_license_permit",
    label: "Medical licenses & permits",
    description: "Nursing licenses, work permits and similar documents.",
  },
  {
    value: "other",
    label: "Other documents",
    description: "Anything else that supports your application.",
  },
];

export const DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;
export const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
/** `accept` attribute for file inputs (extensions + MIME types). */
export const DOCUMENT_ACCEPT = [
  ...DOCUMENT_EXTENSIONS.map((extension) => `.${extension}`),
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
].join(",");

export const formatFileSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Client-side pre-check (the API validates again, including file content). */
export const validateDocumentFile = (file: File): string | undefined => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!DOCUMENT_EXTENSIONS.includes(extension)) {
    return "Only PDF, DOC, DOCX, JPG and PNG files are allowed.";
  }

  if (file.size === 0) {
    return "This file is empty.";
  }

  if (file.size > DOCUMENT_MAX_BYTES) {
    return `Files must be ${DOCUMENT_MAX_BYTES / (1024 * 1024)} MB or smaller (this one is ${formatFileSize(file.size)}).`;
  }

  return undefined;
};
