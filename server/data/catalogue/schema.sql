PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- BGG-derived normalized game data
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,

  source_provider TEXT NOT NULL,
  source_external_id TEXT NOT NULL,

  title TEXT,
  description TEXT,
  year_published INTEGER,

  thumbnail_url TEXT,
  image_url TEXT,

  min_players INTEGER,
  max_players INTEGER,

  min_play_minutes INTEGER,
  max_play_minutes INTEGER,

  publisher_min_age INTEGER,

  complexity_average REAL,

  bayesian_average REAL,
  users_rated INTEGER,

  community_age_poll_json TEXT NOT NULL DEFAULT '[]',
  player_count_poll_json TEXT NOT NULL DEFAULT '[]',

  mechanics_json TEXT NOT NULL DEFAULT '[]',
  categories_json TEXT NOT NULL DEFAULT '[]',

  base_game_ids_json TEXT NOT NULL DEFAULT '[]',

  UNIQUE (
    source_provider,
    source_external_id
  )
);

-- -----------------------------------------------------------------------------
-- Shuffled-owned catalogue metadata
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS catalogue_entries (
  game_id TEXT PRIMARY KEY,

  content_classification TEXT NOT NULL DEFAULT 'unknown'
    CHECK (
      content_classification IN (
        'unknown',
        'family-friendly',
        'mature'
      )
    ),

  curated_tags_json TEXT NOT NULL DEFAULT '[]',

  is_included INTEGER NOT NULL DEFAULT 1
    CHECK (
      is_included IN (0, 1)
    ),

  availability_region TEXT NOT NULL DEFAULT 'AU',

  availability_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (
      availability_status IN (
        'unknown',
        'widely-available',
        'available',
        'limited',
        'preorder',
        'out-of-print'
      )
    ),

  availability_checked_at TEXT,

  imported_at TEXT NOT NULL,

  FOREIGN KEY (game_id)
    REFERENCES games(id)
    ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_games_title
  ON games(title);

CREATE INDEX IF NOT EXISTS idx_catalogue_entries_included
  ON catalogue_entries(is_included);