-- Cardon prospect: pulls from public skincare benchmark data
INSERT INTO prospect_profiles (
  client_id, prospect_name, brand_name, password, website,
  personal_note, data_source, strategy_text,
  recommendation_1, recommendation_2, recommendation_3
) VALUES (
  'cardon', 'Narae', 'Cardon', 'cardon2026', 'cardonskin.com',
  'Narae - this report is your private snapshot of how AI search is treating Cardon right now. Pulled from our skincare category benchmark across ChatGPT and Claude. Findings below.',
  'public',
  'The skincare AI landscape is dominated by a CeraVe/La Roche-Posay duopoly — these brands appear in virtually every AI recommendation. Cardon has a differentiated positioning as Korean-influenced men''s skincare, but AI models don''t yet recognize that differentiation. When someone asks "what''s the best men''s skincare," AI defaults to the mass-market leaders. Breaking through requires building the kind of authoritative, structured content presence that shifts AI models from "CeraVe for everyone" to "Cardon for men who want something better." Your Wharton pedigree and Target distribution give you credibility signals that AI should be surfacing — they''re just not connected to the right content yet.',
  'Create dedicated "men''s skincare" content on cardonskin.com that AI models can index as the definitive resource — ingredient breakdowns, routine guides, and comparison content that explicitly positions Cardon against CeraVe/Cetaphil for men.',
  'Pursue placements in men''s lifestyle and grooming publications (GQ, Men''s Health, Esquire) that AI training data heavily weights. One authoritative "best men''s skincare brands" feature that names Cardon can shift AI recommendations.',
  'Build structured product pages with schema markup, clinical data, and Korean skincare ingredient education that differentiates Cardon from commodity brands in AI''s knowledge graph.'
) ON CONFLICT (client_id) DO UPDATE SET
  prospect_name = EXCLUDED.prospect_name,
  brand_name = EXCLUDED.brand_name,
  password = EXCLUDED.password,
  website = EXCLUDED.website,
  personal_note = EXCLUDED.personal_note,
  data_source = EXCLUDED.data_source,
  strategy_text = EXCLUDED.strategy_text,
  recommendation_1 = EXCLUDED.recommendation_1,
  recommendation_2 = EXCLUDED.recommendation_2,
  recommendation_3 = EXCLUDED.recommendation_3;
