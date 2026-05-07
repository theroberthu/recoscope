-- Demo prospect profile (CeraVe as the demo brand)
INSERT INTO prospect_profiles (client_id, prospect_name, brand_name, password)
VALUES ('demo', 'there', 'CeraVe', 'demo2026')
ON CONFLICT (client_id) DO NOTHING;
