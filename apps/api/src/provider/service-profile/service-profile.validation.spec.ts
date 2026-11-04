import { validateServiceProfilePayload } from './service-profile.validation';

const validBody = {
  careServices: ['elderly_care', 'Companionship'],
  skills: ['first_aid_cpr', 'meal_preparation'],
  yearsOfExperience: 4,
  previousCareExperience: 'Cared for my grandmother for three years.',
  qualifications: ['cna'],
  languages: ['english', 'spanish'],
  coverLetter:
    'I am a patient and reliable caregiver who loves helping people.',
  jobCategories: ['elderly_care'],
  tasksWilling: ['meal_preparation', 'companionship'],
  tasksUnwilling: ['heavy_lifting'],
  clientGroups: ['seniors'],
};

const errorsOf = (body: unknown): string[] => {
  try {
    validateServiceProfilePayload(body);
    return [];
  } catch (error) {
    return (error as { response: { errors: string[] } }).response.errors;
  }
};

describe('validateServiceProfilePayload', () => {
  it('normalizes enum values, trims text and nulls unused "other" fields', () => {
    const result = validateServiceProfilePayload({
      ...validBody,
      careServices: ['elderly_care', 'Companionship', 'elderly_care'],
      otherCareService: 'ignored because OTHER is not selected',
      yearsOfExperience: '4',
      coverLetter: `  ${validBody.coverLetter}  `,
    });

    expect(result.careServices).toEqual(['ELDERLY_CARE', 'COMPANIONSHIP']);
    expect(result.otherCareService).toBeNull();
    expect(result.yearsOfExperience).toBe(4);
    expect(result.coverLetter).toBe(validBody.coverLetter);
    expect(result.qualifications).toEqual(['CNA']);
    expect(result.tasksUnwilling).toEqual(['HEAVY_LIFTING']);
  });

  it('requires "other" text only when OTHER is selected', () => {
    expect(
      errorsOf({ ...validBody, careServices: ['other'], skills: ['other'] }),
    ).toEqual([
      'otherCareService is required when "Other" is selected',
      'otherSkill is required when "Other" is selected',
    ]);

    const result = validateServiceProfilePayload({
      ...validBody,
      languages: ['other'],
      otherLanguage: ' Haitian Creole ',
    });
    expect(result.otherLanguage).toBe('Haitian Creole');
  });

  it('rejects unknown options instead of dropping them', () => {
    expect(errorsOf({ ...validBody, skills: ['juggling'] })).toEqual([
      'skills contains an invalid option: juggling',
    ]);
    expect(errorsOf({ ...validBody, jobCategories: ['other'] })).toEqual([
      'jobCategories contains an invalid option: other',
    ]);
  });

  it('enforces required selections, ranges and lengths', () => {
    expect(
      errorsOf({
        ...validBody,
        careServices: [],
        yearsOfExperience: 99,
        previousCareExperience: '',
        coverLetter: 'Too short',
        clientGroups: undefined,
      }),
    ).toEqual([
      'careServices must include at least 1 option',
      'yearsOfExperience must be a whole number between 0 and 60',
      'previousCareExperience is required',
      'coverLetter must be at least 20 characters',
      'clientGroups must include at least 1 option',
    ]);
  });

  it('rejects tasks listed as both willing and unwilling', () => {
    expect(
      errorsOf({
        ...validBody,
        tasksWilling: ['laundry', 'pet_care'],
        tasksUnwilling: ['pet_care'],
      }),
    ).toEqual([
      'tasksUnwilling cannot repeat tasks listed in tasksWilling: pet_care',
    ]);
  });
});
