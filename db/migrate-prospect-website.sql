-- Add website field to prospect_profiles
ALTER TABLE prospect_profiles ADD COLUMN IF NOT EXISTS website TEXT NULL;

-- Set websites for existing prospects
UPDATE prospect_profiles SET website = 'elitefts.com' WHERE client_id = 'elitefts';
UPDATE prospect_profiles SET website = 'forestleaf.com' WHERE client_id = 'forestleaf';
UPDATE prospect_profiles SET website = 'bossmanbrands.com' WHERE client_id = 'bossman';
UPDATE prospect_profiles SET website = 'rollga.com' WHERE client_id = 'rollga';
UPDATE prospect_profiles SET website = 'bodylastics.com' WHERE client_id = 'bodylastics';
