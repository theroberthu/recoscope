-- RecoScope database schema (Neon Postgres)

CREATE TABLE categories (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  tracker_type  TEXT        NOT NULL CHECK (tracker_type IN ('evergreen', 'seasonal')),
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE runs (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id   BIGINT      NOT NULL REFERENCES categories (id),
  run_date      DATE        NOT NULL,
  period_label  TEXT        NOT NULL,
  tracker_type  TEXT        NOT NULL CHECK (tracker_type IN ('evergreen', 'seasonal')),
  status        TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'published')),
  summary       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_responses (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id        BIGINT      NOT NULL REFERENCES runs (id),
  agent_name    TEXT        NOT NULL,
  prompt_number INTEGER     NOT NULL,
  prompt_text   TEXT        NOT NULL,
  raw_response  TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE brand_mentions (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id                BIGINT      NOT NULL REFERENCES runs (id),
  agent_name            TEXT        NOT NULL,
  prompt_number         INTEGER     NOT NULL,
  brand_name_raw        TEXT        NOT NULL,
  brand_name_normalized TEXT        NOT NULL,
  mention_rank          INTEGER     NOT NULL CHECK (mention_rank > 0),
  is_top_3              BOOLEAN     NOT NULL DEFAULT false,
  is_first              BOOLEAN     NOT NULL DEFAULT false,
  mentioned             BOOLEAN     NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE run_insights (
  id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id                  BIGINT      NOT NULL REFERENCES runs (id) UNIQUE,
  top_brands_summary      TEXT,
  common_traits           TEXT,
  cross_agent_differences TEXT,
  market_gaps             TEXT,
  key_takeaway            TEXT,
  audit_angle             TEXT,
  reviewed_by_human       BOOLEAN     NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_leads (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name              TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  brand_name        TEXT        NOT NULL,
  website           TEXT,
  category_interest TEXT,
  source_page       TEXT,
  lead_type         TEXT        NOT NULL DEFAULT 'audit' CHECK (lead_type IN ('audit', 'snapshot', 'waitlist')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
