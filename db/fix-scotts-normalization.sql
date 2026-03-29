-- Fix Scotts brand normalization for lawn-fertilizer run(s).
-- All Scotts product variants should normalize to "Scotts Turf Builder"
-- so they aggregate correctly in the ranking chart.

UPDATE brand_mentions
SET brand_name_normalized = 'Scotts Turf Builder'
WHERE brand_name_normalized IN (
  'Scotts Weed & Feed',
  'Scotts Weed and Feed',
  'Scotts Turf Builder Triple Action',
  'Scotts Lawn Pro',
  'Scotts GrubEx',
  'Scotts Turf Builder Weed and Feed'
)
AND run_id IN (
  SELECT id FROM runs
  WHERE category_id = (SELECT id FROM categories WHERE slug = 'lawn-fertilizer')
);
