-- prospect_profiles: per-prospect editable content and auth
CREATE TABLE IF NOT EXISTS prospect_profiles (
  client_id        TEXT PRIMARY KEY,
  prospect_name    TEXT NOT NULL,
  brand_name       TEXT NOT NULL,
  password         TEXT NOT NULL,
  personal_note    TEXT,
  recommendation_1 TEXT,
  recommendation_2 TEXT,
  recommendation_3 TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the 5 active prospects
INSERT INTO prospect_profiles (client_id, prospect_name, brand_name, password) VALUES
  ('forestleaf', 'Hayim', 'ForestLeaf', 'forestleaf2026'),
  ('bossman', 'Luis', 'Bossman', 'bossman2026'),
  ('rollga', 'Todd', 'Rollga', 'rollga2026'),
  ('bodylastics', 'Blake', 'Bodylastics', 'bodylastics2026'),
  ('cardon', 'Narae', 'Cardon', 'cardon2026')
ON CONFLICT (client_id) DO NOTHING;
