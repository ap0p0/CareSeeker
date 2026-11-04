import { Injectable } from '@nestjs/common';
import { ProviderDocumentsService } from '../documents/documents.service';
import type { ProviderDocumentResponse } from '../documents/documents.types';
import { ProviderOnboardingService } from '../onboarding/onboarding.service';
import { ProviderProfileService } from '../profile/profile.service';
import type { ProviderProfileResponse } from '../profile/profile.types';
import { ProviderServiceProfileService } from '../service-profile/service-profile.service';
import { ProviderWorkPreferencesService } from '../work-preferences/work-preferences.service';
import type {
  ProfileCompletion,
  ProfileCompletionSection,
  ProviderOverviewResponse,
} from './overview.types';

/**
 * Read-only aggregate of a provider's submitted data (overview page, dashboard
 * widgets). Composes the per-step services so each step keeps owning its own
 * shape and validation; nothing is written here.
 */
@Injectable()
export class ProviderOverviewService {
  constructor(
    private readonly profileService: ProviderProfileService,
    private readonly serviceProfileService: ProviderServiceProfileService,
    private readonly workPreferencesService: ProviderWorkPreferencesService,
    private readonly documentsService: ProviderDocumentsService,
    private readonly onboardingService: ProviderOnboardingService,
  ) {}

  async get(userId: string): Promise<ProviderOverviewResponse> {
    const [profile, serviceProfile, workPreferences, documents, onboarding] =
      await Promise.all([
        this.profileService.getProfile(userId),
        this.serviceProfileService.get(userId),
        this.workPreferencesService.get(userId),
        this.documentsService.list(userId),
        this.onboardingService.getStatus(userId),
      ]);

    return {
      profile,
      serviceProfile: serviceProfile.profile,
      workPreferences: workPreferences.preferences,
      documents: documents.documents,
      onboarding,
      completion: computeCompletion(
        profile,
        serviceProfile.completed,
        workPreferences.completed,
        documents.documents,
      ),
    };
  }
}

/**
 * Weighted checklist behind "profile completion". Documents are optional in
 * onboarding but count here because they drive verification and trust.
 */
export function computeCompletion(
  profile: ProviderProfileResponse,
  hasServiceProfile: boolean,
  hasWorkPreferences: boolean,
  documents: ProviderDocumentResponse[],
): ProfileCompletion {
  const sections: ProfileCompletionSection[] = [
    {
      key: 'personal_info',
      label: 'Personal information',
      weight: 20,
      complete: Boolean(
        profile.dateOfBirth && profile.phone && profile.address,
      ),
    },
    {
      key: 'profile_picture',
      label: 'Profile picture',
      weight: 10,
      complete: profile.profileImageUrl !== null,
    },
    {
      key: 'services',
      label: 'Services & job interests',
      weight: 25,
      complete: hasServiceProfile,
    },
    {
      key: 'availability',
      label: 'Availability & work preferences',
      weight: 25,
      complete: hasWorkPreferences,
    },
    {
      key: 'cv',
      label: 'CV / resume',
      weight: 10,
      complete: documents.some((document) => document.category === 'cv_resume'),
    },
    {
      key: 'supporting_documents',
      label: 'Certificates, references or licenses',
      weight: 10,
      complete: documents.some((document) =>
        [
          'reference_letter',
          'educational_certificate',
          'professional_certificate',
          'medical_license_permit',
        ].includes(document.category),
      ),
    },
  ];

  const percentage = sections.reduce(
    (total, section) => total + (section.complete ? section.weight : 0),
    0,
  );

  return { percentage, sections };
}
