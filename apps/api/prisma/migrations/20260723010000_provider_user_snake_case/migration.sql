-- This migration previously tried to rename Provider* tables/columns to snake_case
-- and remap FKs from Provider.id → User.id.
--
-- That work is already done by 20260722120000_provider_domain, which:
--   - recreates provider_availability / care_requests / provider_verifications
--     with snake_case columns
--   - points FKs at "User"("id")
--   - drops the legacy "Provider" table
--
-- The old SQL failed in production with:
--   ERROR: current transaction is aborted...
-- because it ran `UPDATE ... FROM "Provider"` after Provider was already gone.
--
-- Keep a no-op so migration history stays contiguous and deploy can proceed.

SELECT 1;
