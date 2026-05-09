-- Add data_source and strategy_text columns to prospect_profiles
ALTER TABLE prospect_profiles ADD COLUMN IF NOT EXISTS data_source TEXT NULL;
ALTER TABLE prospect_profiles ADD COLUMN IF NOT EXISTS strategy_text TEXT NULL;

-- Insert EliteFTS prospect profile
INSERT INTO prospect_profiles (
  client_id, prospect_name, brand_name, password, personal_note,
  data_source, strategy_text,
  recommendation_1, recommendation_2, recommendation_3
) VALUES (
  'elitefts', 'Dave', 'EliteFTS', 'elitefts2026',
  'Dave - this report is your private snapshot of how AI search is treating EliteFTS right now. I tracked your brand across ChatGPT and Claude over 5 days. Findings below.',
  'bodylastics',
  'EliteFTS is in the AI conversation for resistance bands — both ChatGPT and Claude surface you regularly in top-3 results. The gap is that neither model picks you first. You''re stuck in the "consideration set" rather than the "default recommendation." For a DTC-first brand, this matters because AI-driven product discovery is replacing the Google search funnel. The path from consideration to first-pick requires strengthening the editorial and review signals that AI models weight most heavily — expert endorsements, structured product content, and authoritative third-party coverage that positions EliteFTS as the category leader, not just a viable option.',
  'Build out structured, authoritative content on elitefts.com that AI models can reference — detailed product comparison pages, expert training guides, and specification breakdowns that position EliteFTS as the definitive resource for resistance training equipment.',
  'Pursue editorial placements and expert endorsements in fitness media that AI training data draws from. AI models weight third-party authority signals heavily when deciding first-pick recommendations.',
  'Create brand-level content assets (founder story, manufacturing process, patent/design innovation pages) that differentiate EliteFTS from commodity resistance band brands in AI''s knowledge graph.'
) ON CONFLICT (client_id) DO NOTHING;
