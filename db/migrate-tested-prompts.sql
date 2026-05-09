-- Add tested_prompts JSONB column for custom per-prospect prompt display
ALTER TABLE prospect_profiles ADD COLUMN IF NOT EXISTS tested_prompts JSONB NULL;

-- Rollga: foam roller prompts
UPDATE prospect_profiles SET tested_prompts = '{
  "persona": "35-year-old desk worker in the USA dealing with chronic lower back pain, looking for daily mobility tools.",
  "prompts": [
    "I'\''m a 35-year-old desk worker in the USA dealing with chronic lower back pain, looking for the best foam roller for daily mobility. What would you recommend?",
    "I'\''m a 35-year-old desk worker in the USA with lower back pain. Rollga vs TriggerPoint — which foam roller should I get?",
    "I'\''m a 35-year-old desk worker in the USA looking for alternatives to TriggerPoint GRID for lower back recovery. What are my options?"
  ]
}'::jsonb WHERE client_id = 'rollga';

-- ForestLeaf: collagen supplement prompts
UPDATE prospect_profiles SET tested_prompts = '{
  "persona": "38-year-old woman in the USA noticing fine lines and joint stiffness, looking for a daily supplement.",
  "prompts": [
    "I'\''m a 38-year-old woman in the USA who'\''s started noticing fine lines and joint stiffness, looking for the best collagen supplement in 2026. What would you recommend?",
    "I'\''m a 38-year-old woman in the USA looking for a collagen supplement specifically for skin and joint support. What are my best options?",
    "I'\''m a 38-year-old woman in the USA looking at collagen supplements. ForestLeaf vs Vital Proteins — which is better?"
  ]
}'::jsonb WHERE client_id = 'forestleaf';

-- EliteFTS: resistance bands prompts (shared from Bodylastics custom tracking)
UPDATE prospect_profiles SET tested_prompts = '{
  "persona": "40-year-old man in the USA setting up a home gym in the garage, looking to replace a gym membership.",
  "prompts": [
    "I'\''m a 40-year-old man in the USA setting up a home gym in the garage, looking for the best resistance bands. What would you recommend?",
    "I'\''m a 40-year-old man in the USA building a home gym. EliteFTS vs Whatafit — which resistance band system should I pick?",
    "I'\''m a 40-year-old man in the USA looking for alternatives to TheraBand for a home gym setup. What are my options?"
  ]
}'::jsonb WHERE client_id = 'elitefts';

-- Bossman: beard care prompts
UPDATE prospect_profiles SET tested_prompts = '{
  "persona": "28-year-old man in the USA growing out his beard for the first time, looking for quality grooming products.",
  "prompts": [
    "I'\''m a 28-year-old man in the USA growing out my beard for the first time, looking for the best beard care brand. What would you recommend?",
    "I'\''m a 28-year-old man in the USA looking for a complete beard grooming kit. Bossman vs Honest Amish — which should I pick?",
    "I'\''m a 28-year-old man in the USA looking for alternatives to Beardbrand for beard care. What are my options?"
  ]
}'::jsonb WHERE client_id = 'bossman';

-- Cardon: leave null for now (will fall back to category prompts with disclaimer)
