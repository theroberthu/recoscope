-- Create prospect categories (is_active = false so they don't show on public /tracker)
INSERT INTO categories (name, slug, tracker_type, is_active) VALUES
  ('Collagen Supplements', 'collagen-supplements', 'evergreen', false),
  ('Beard Care', 'beard-care', 'evergreen', false),
  ('Foam Rollers', 'foam-rollers', 'evergreen', false),
  ('Resistance Bands', 'resistance-bands', 'evergreen', false)
ON CONFLICT (slug) DO NOTHING;

-- Create private prospect runs (is_public = false, client_id set per brand)
INSERT INTO runs (category_id, run_date, period_label, tracker_type, status, client_id, is_public) VALUES
  ((SELECT id FROM categories WHERE slug = 'collagen-supplements'), '2026-05-04', '2026-05', 'evergreen', 'draft', 'forestleaf', false),
  ((SELECT id FROM categories WHERE slug = 'beard-care'), '2026-05-04', '2026-05', 'evergreen', 'draft', 'bossman', false),
  ((SELECT id FROM categories WHERE slug = 'foam-rollers'), '2026-05-04', '2026-05', 'evergreen', 'draft', 'rollga', false),
  ((SELECT id FROM categories WHERE slug = 'resistance-bands'), '2026-05-04', '2026-05', 'evergreen', 'draft', 'bodylastics', false);

-- Verify: show the created runs
SELECT r.id, c.name, r.client_id, r.is_public, r.status
FROM runs r JOIN categories c ON c.id = r.category_id
WHERE r.client_id IN ('forestleaf', 'bossman', 'rollga', 'bodylastics');
