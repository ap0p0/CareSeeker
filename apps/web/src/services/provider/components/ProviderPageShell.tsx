import { Stack } from "@mui/material";
import type { ReactNode } from "react";
import ProviderErrorAlert from "./ProviderErrorAlert";
import ProviderLoadingState from "./ProviderLoadingState";
import ProviderPageHeader from "./ProviderPageHeader";

type ProviderPageShellProps = {
  title: string;
  description?: string;
  /** Leading header element, e.g. an avatar. */
  headerAdornment?: ReactNode;
  subNav?: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children?: ReactNode;
};

const ProviderPageShell = ({
  title,
  description,
  headerAdornment,
  subNav,
  isLoading = false,
  error = null,
  onRetry,
  children,
}: ProviderPageShellProps) => {
  return (
    <Stack spacing={2}>
      <ProviderPageHeader
        title={title}
        description={description}
        adornment={headerAdornment}
      />
      {subNav}
      {error ? <ProviderErrorAlert message={error} onRetry={onRetry} /> : null}
      {isLoading ? <ProviderLoadingState /> : children}
    </Stack>
  );
};

export default ProviderPageShell;
