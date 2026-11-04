-- Overnight schedule windows (e.g. 22:00 → 06:00): the window ends on the
-- following day. Same-day windows still require start < end.
ALTER TABLE "provider_availability"
  ADD COLUMN "ends_next_day" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "provider_availability"
  DROP CONSTRAINT "provider_availability_time_order_check";

ALTER TABLE "provider_availability"
  ADD CONSTRAINT "provider_availability_time_order_check"
  CHECK (("ends_next_day" = false AND "start_time" < "end_time")
      OR ("ends_next_day" = true AND "end_time" <= "start_time"));
