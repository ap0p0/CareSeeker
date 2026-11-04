import {
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_MIME_TYPES,
} from '../provider/common/uploaded-file';

export type BucketPolicy = {
  fileSizeLimit?: number;
  allowedMimeTypes?: string[];
};

const DEFAULT_PROVIDER_PROFILE_IMAGES_BUCKET = 'provider-profile-images';
const DEFAULT_PROVIDER_DOCUMENTS_BUCKET = 'provider-documents';

export function getProviderProfileImagesBucket(): string {
  return (
    process.env['SUPABASE_PROVIDER_PROFILE_IMAGES_BUCKET']?.trim() ||
    DEFAULT_PROVIDER_PROFILE_IMAGES_BUCKET
  );
}

/** Private bucket for CVs, references, certificates, licenses, … */
export function getProviderDocumentsBucket(): string {
  return (
    process.env['SUPABASE_PROVIDER_DOCUMENTS_BUCKET']?.trim() ||
    DEFAULT_PROVIDER_DOCUMENTS_BUCKET
  );
}

/** Policies applied when a private bucket has to be created on first use. */
export function getBucketPolicies(): Record<string, BucketPolicy> {
  return {
    [getProviderProfileImagesBucket()]: {
      fileSizeLimit: PROFILE_IMAGE_MAX_BYTES,
      allowedMimeTypes: [...PROFILE_IMAGE_MIME_TYPES],
    },
    // Document types are validated by the API (content sniffing); the bucket
    // policy only caps the size as a second line of defence.
    [getProviderDocumentsBucket()]: {
      fileSizeLimit: 15 * 1024 * 1024,
    },
  };
}
