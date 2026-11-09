import { Stack, Typography } from "@mui/material";
import type { ProviderServiceProfile } from "../../../../../queries/provider";
import { accountSettingsPath } from "../../AccountSettings/settingsTabs";
import {
  careServiceLabels,
  clientGroupLabels,
  languageLabels,
  qualificationLabels,
  skillLabels,
  taskLabels,
} from "../labels";
import {
  ChipList,
  DetailRow,
  MissingSection,
  OverviewCard,
} from "../../../../../components/OverviewCard";

type ServicesCardProps = {
  serviceProfile: ProviderServiceProfile | null;
  /** Limit to a subset of blocks (profile sub-pages). */
  sections?: (
    | "services"
    | "experience"
    | "qualifications"
    | "languages"
    | "jobs"
  )[];
  title?: string;
  /** Inline quick edit (overview). */
  onEdit?: () => void;
};

const ALL: NonNullable<ServicesCardProps["sections"]> = [
  "services",
  "experience",
  "qualifications",
  "languages",
  "jobs",
];

const ServicesCard = ({
  serviceProfile,
  sections = ALL,
  title = "Services & job interests",
  onEdit,
}: ServicesCardProps) => {
  const editTo = accountSettingsPath("services");
  const show = (key: (typeof ALL)[number]) => sections.includes(key);

  return (
    <OverviewCard title={title} editTo={editTo} onEdit={onEdit}>
      {!serviceProfile ? (
        <MissingSection
          text="You have not told us about your services yet."
          to={editTo}
          onAction={onEdit}
        />
      ) : (
        <Stack spacing={2}>
          {show("services") ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Services offered</Typography>
              <ChipList
                items={careServiceLabels(
                  serviceProfile.careServices,
                  serviceProfile.otherCareService,
                )}
                color="primary"
              />
              <Typography variant="subtitle2">Skills</Typography>
              <ChipList
                items={skillLabels(
                  serviceProfile.skills,
                  serviceProfile.otherSkill,
                )}
              />
            </Stack>
          ) : null}

          {show("experience") ? (
            <Stack spacing={1}>
              <DetailRow
                label="Experience"
                value={`${serviceProfile.yearsOfExperience} ${
                  serviceProfile.yearsOfExperience === 1 ? "year" : "years"
                }`}
              />
              <DetailRow
                label="Previous care experience"
                value={serviceProfile.previousCareExperience}
              />
              <DetailRow label="About" value={serviceProfile.coverLetter} />
            </Stack>
          ) : null}

          {show("qualifications") ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Qualifications</Typography>
              <ChipList
                items={qualificationLabels(
                  serviceProfile.qualifications,
                  serviceProfile.otherQualification,
                )}
                emptyText="No qualifications listed"
              />
            </Stack>
          ) : null}

          {show("languages") ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Languages</Typography>
              <ChipList
                items={languageLabels(
                  serviceProfile.languages,
                  serviceProfile.otherLanguage,
                )}
              />
            </Stack>
          ) : null}

          {show("jobs") ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">
                Preferred care categories
              </Typography>
              <ChipList
                items={careServiceLabels(serviceProfile.jobCategories)}
              />
              <Typography variant="subtitle2">
                Tasks willing to perform
              </Typography>
              <ChipList items={taskLabels(serviceProfile.tasksWilling)} />
              <Typography variant="subtitle2">
                Tasks not willing to perform
              </Typography>
              <ChipList
                items={taskLabels(serviceProfile.tasksUnwilling)}
                emptyText="No restrictions"
                color="warning"
              />
              <Typography variant="subtitle2">
                Preferred client groups
              </Typography>
              <ChipList
                items={clientGroupLabels(serviceProfile.clientGroups)}
              />
            </Stack>
          ) : null}
        </Stack>
      )}
    </OverviewCard>
  );
};

export default ServicesCard;
