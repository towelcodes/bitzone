CREATE TABLE IF NOT EXISTS files (
  key          TEXT PRIMARY KEY,
  filename     TEXT NOT NULL,
  size         INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  uploader_id  TEXT NOT NULL,
  title        TEXT,
  description  TEXT,
  expires_at   INTEGER,          -- epoch ms, NULL = never expires
  created_at   INTEGER NOT NULL
);

-- speed up finding expired files in the cleanup cron
CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files (expires_at);
-- speed up listing files by owner
CREATE INDEX IF NOT EXISTS idx_files_uploader_id ON files (uploader_id);
