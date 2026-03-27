-- Allow 'free_monthly_signup' as a lead_type value
ALTER TABLE audit_leads DROP CONSTRAINT IF EXISTS audit_leads_lead_type_check;
ALTER TABLE audit_leads ADD CONSTRAINT audit_leads_lead_type_check
  CHECK (lead_type IN ('audit', 'snapshot', 'waitlist', 'free_monthly_signup'));
