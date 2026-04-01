import { InternalServerErrorException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env['SUPABASE_URL']?.trim().replace(/\/+$/, '');
  const supabaseSecretKey =
    process.env['SUPABASE_SECRET_KEY']?.trim() ??
    process.env['SUPABASE_SERVICE_ROLE_KEY']?.trim();

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new InternalServerErrorException({
      code: 'MISSING_SUPABASE_ADMIN_CONFIG',
      message:
        'Set SUPABASE_URL and SUPABASE_SECRET_KEY on the API (or legacy SUPABASE_SERVICE_ROLE_KEY).',
    });
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
