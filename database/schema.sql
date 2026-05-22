-- DevPulse database schema
-- Run in pgAdmin Query Tool or: npm run db:migrate

-- Reusable trigger to refresh updated_at on row changes
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── users ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'contributor'
               CHECK (role IN ('contributor', 'maintainer')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ─── issues ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS issues (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  description TEXT         NOT NULL
                CHECK (char_length(description) >= 20),
  type        VARCHAR(20)  NOT NULL
                CHECK (type IN ('bug', 'feature_request')),
  status      VARCHAR(20)  NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id INTEGER      NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_issues_updated_at ON issues;
CREATE TRIGGER trg_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Helpful indexes for list/filter queries (no JOINs required)
CREATE INDEX IF NOT EXISTS idx_issues_reporter_id ON issues (reporter_id);
CREATE INDEX IF NOT EXISTS idx_issues_status      ON issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_type        ON issues (type);
CREATE INDEX IF NOT EXISTS idx_issues_created_at  ON issues (created_at DESC);
