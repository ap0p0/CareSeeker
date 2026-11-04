import { computeCompletion } from './overview.service';
import type { ProviderProfileResponse } from '../profile/profile.types';
import type { ProviderDocumentResponse } from '../documents/documents.types';

const profile = (
  overrides: Partial<ProviderProfileResponse> = {},
): ProviderProfileResponse => ({
  id: 'u1',
  userId: 'u1',
  name: 'Jane',
  surname: 'Doe',
  email: 'jane@example.com',
  dateOfBirth: '1990-05-14',
  gender: null,
  phone: '+15551234567',
  address: {
    addressLine1: '1 A',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
  },
  profileImageUrl: 'https://example/pic',
  status: 'pending_verification',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const doc = (category: string): ProviderDocumentResponse => ({
  id: category,
  providerId: 'u1',
  category,
  originalFilename: `${category}.pdf`,
  mimeType: 'application/pdf',
  sizeBytes: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('computeCompletion', () => {
  it('sums the weights of completed sections to 100 when everything is there', () => {
    const result = computeCompletion(profile(), true, true, [
      doc('cv_resume'),
      doc('professional_certificate'),
    ]);
    expect(result.percentage).toBe(100);
    expect(result.sections.every((section) => section.complete)).toBe(true);
    expect(result.sections.reduce((sum, s) => sum + s.weight, 0)).toBe(100);
  });

  it('reports what is missing', () => {
    const result = computeCompletion(
      profile({ profileImageUrl: null }),
      true,
      false,
      [doc('other')],
    );
    expect(result.percentage).toBe(45);
    expect(
      result.sections.filter((s) => !s.complete).map((s) => s.key),
    ).toEqual([
      'profile_picture',
      'availability',
      'cv',
      'supporting_documents',
    ]);
  });
});
