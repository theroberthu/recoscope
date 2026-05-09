-- Add category_slug for zero-state fallback (loads category runs even when brand has 0 mentions)
ALTER TABLE prospect_profiles ADD COLUMN IF NOT EXISTS category_slug TEXT NULL;

-- Cardon uses skincare category data
UPDATE prospect_profiles SET category_slug = 'skincare' WHERE client_id = 'cardon';
