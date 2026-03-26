-- Backfill run_insights for office-chairs with content that was previously
-- hardcoded in the page component. Run this after seed.sql if the
-- run_insights row exists but has NULL fields.
--
-- This uses an UPSERT pattern: if a run_insights row already exists for the
-- office-chairs run, it updates only NULL fields. If no row exists, it inserts.

DO $$
DECLARE
  v_run_id BIGINT;
BEGIN
  -- Find the latest run for office-chairs
  SELECT r.id INTO v_run_id
  FROM runs r
  JOIN categories c ON c.id = r.category_id
  WHERE c.slug = 'office-chairs'
  ORDER BY r.run_date DESC
  LIMIT 1;

  IF v_run_id IS NULL THEN
    RAISE NOTICE 'No run found for office-chairs. Skipping backfill.';
    RETURN;
  END IF;

  -- Upsert: insert if missing, update NULLs if row exists
  INSERT INTO run_insights (
    run_id,
    key_takeaway,
    audit_angle,
    common_traits,
    cross_agent_differences,
    market_gaps,
    top_brands_summary
  ) VALUES (
    v_run_id,
    'Premium ergonomic brands dominate AI recommendations for office chairs. Steelcase and Herman Miller hold the top positions across all four models tested. Budget brands appear in marketplace results but are absent from AI top picks.',
    'Mid-market ergonomic brands are largely invisible to AI. Brands investing in structured content, expert reviews, and detailed spec pages have a clear path to improving their AI recommendation visibility.',
    'Strong ergonomic positioning with detailed product specs and adjustment features.
Deep review ecosystems across major retail and editorial platforms.
Consistent brand presence in professional and workspace content.
Clear price-tier positioning that AI models can reference confidently.',
    'All four models agree on the top two brands but diverge on the third pick.
Budget brands like BestOffice and Mainstays appear in marketplace results but AI models rarely recommend them.
AI models weight editorial reviews and spec-rich product pages more than marketplace sales volume.',
    'Mid-market ergonomic brands ($300-$600) are almost invisible to AI. Structured content and expert reviews could open this segment.
Brands without detailed spec pages and third-party editorial coverage are excluded from top recommendations.
Standing desk chairs and hybrid seating are underserved. No brand owns this niche in AI results.',
    'Steelcase and Herman Miller lead across all models. Secretlab and HON appear as challengers. Budget brands are absent from AI recommendations despite strong marketplace presence.'
  )
  ON CONFLICT (run_id) DO UPDATE SET
    key_takeaway = COALESCE(run_insights.key_takeaway, EXCLUDED.key_takeaway),
    audit_angle = COALESCE(run_insights.audit_angle, EXCLUDED.audit_angle),
    common_traits = COALESCE(run_insights.common_traits, EXCLUDED.common_traits),
    cross_agent_differences = COALESCE(run_insights.cross_agent_differences, EXCLUDED.cross_agent_differences),
    market_gaps = COALESCE(run_insights.market_gaps, EXCLUDED.market_gaps),
    top_brands_summary = COALESCE(run_insights.top_brands_summary, EXCLUDED.top_brands_summary);
END $$;
