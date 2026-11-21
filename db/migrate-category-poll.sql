-- Additive migration; benchmark and lead tables are unaffected.
-- Apply once to the existing Neon database before enabling the homepage poll.
CREATE TABLE IF NOT EXISTS category_poll_votes (
  poll_id TEXT NOT NULL,
  voter_hash TEXT NOT NULL CHECK (voter_hash ~ '^[a-f0-9]{64}$'),
  option_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, voter_hash)
);
