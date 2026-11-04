import { Stack } from "@mui/material";
import DocumentsCard from "../Overview/sections/DocumentsCard";
import ServicesCard from "../Overview/sections/ServicesCard";
import ProviderProfileSectionPage from "./ProviderProfileSectionPage";

const ProfileEducationCertifications = () => (
  <ProviderProfileSectionPage
    title="Education & certifications"
    description="Your qualifications and the certificates and licenses you uploaded."
  >
    {(overview) => (
      <Stack spacing={2}>
        <ServicesCard
          serviceProfile={overview.serviceProfile}
          sections={["qualifications"]}
          title="Qualifications"
        />
        <DocumentsCard
          documents={overview.documents}
          categories={[
            "educational_certificate",
            "professional_certificate",
            "medical_license_permit",
          ]}
          title="Certificates & licenses"
        />
      </Stack>
    )}
  </ProviderProfileSectionPage>
);

export default ProfileEducationCertifications;
