const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {
  DatabaseSync,
} = require('node:sqlite')

// -----------------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------------

const schema = fs.readFileSync(
  path.join(
    __dirname,
    '../data/catalogue/schema.sql',
  ),
  'utf8',
)

function createDatabase() {
  const db = new DatabaseSync(
    ':memory:',
  )

  db.exec(schema)

  return db
}

// -----------------------------------------------------------------------------
// Schema tests
// -----------------------------------------------------------------------------

test(
  'creates the catalogue tables and indexes',
  () => {
    const db = createDatabase()

    try {
      const objects = db
        .prepare(`
          SELECT name, type
          FROM sqlite_master
          WHERE type IN ('table', 'index')
            AND name NOT LIKE 'sqlite_%'
          ORDER BY type, name
        `)
        .all()
        .map((row) => [
          row.name,
          row.type,
        ])

      assert.deepEqual(objects, [
        [
          'idx_catalogue_entries_included',
          'index',
        ],
        [
          'idx_games_title',
          'index',
        ],
        [
          'catalogue_entries',
          'table',
        ],
        [
          'games',
          'table',
        ],
      ])
    } finally {
      db.close()
    }
  },
)

test(
  'enforces the supported content classifications',
  () => {
    const db = createDatabase()

    try {
      db.prepare(`
        INSERT INTO games (
          id,
          source_provider,
          source_external_id
        )
        VALUES (?, ?, ?)
      `).run(
        'game-30549',
        'boardgamegeek',
        '30549',
      )

      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO catalogue_entries (
              game_id,
              content_classification,
              imported_at
            )
            VALUES (?, ?, ?)
          `).run(
            'game-30549',
            'unsupported',
            '2026-10-09T00:00:00Z',
          )
        },
        /CHECK constraint failed/,
      )
    } finally {
      db.close()
    }
  },
)

test(
  'cascades catalogue metadata when a game is deleted',
  () => {
    const db = createDatabase()

    try {
      db.prepare(`
        INSERT INTO games (
          id,
          source_provider,
          source_external_id
        )
        VALUES (?, ?, ?)
      `).run(
        'game-30549',
        'boardgamegeek',
        '30549',
      )

      db.prepare(`
        INSERT INTO catalogue_entries (
          game_id,
          imported_at
        )
        VALUES (?, ?)
      `).run(
        'game-30549',
        '2026-10-09T00:00:00Z',
      )

      db.prepare(`
        DELETE FROM games
        WHERE id = ?
      `).run(
        'game-30549',
      )

      const entry = db
        .prepare(`
          SELECT game_id
          FROM catalogue_entries
          WHERE game_id = ?
        `)
        .get(
          'game-30549',
        )

      assert.equal(
        entry,
        undefined,
      )
    } finally {
      db.close()
    }
  },
)

test(
  'stores Australian availability metadata with safe defaults',
  () => {
    const db = createDatabase()

    try {
      db.prepare(`
        INSERT INTO games (
          id,
          source_provider,
          source_external_id
        )
        VALUES (?, ?, ?)
      `).run(
        'game-30549',
        'boardgamegeek',
        '30549',
      )

      db.prepare(`
        INSERT INTO catalogue_entries (
          game_id,
          imported_at
        )
        VALUES (?, ?)
      `).run(
        'game-30549',
        '2026-10-27T00:00:00Z',
      )

      const entry = db
        .prepare(`
          SELECT
            availability_region,
            availability_status,
            availability_checked_at
          FROM catalogue_entries
          WHERE game_id = ?
        `)
        .get(
          'game-30549',
        )

      assert.equal(
        entry.availability_region,
        'AU',
      )

      assert.equal(
        entry.availability_status,
        'unknown',
      )

      assert.equal(
        entry.availability_checked_at,
        null,
      )
    } finally {
      db.close()
    }
  },
)

test(
  'rejects unsupported availability statuses',
  () => {
    const db = createDatabase()

    try {
      db.prepare(`
        INSERT INTO games (
          id,
          source_provider,
          source_external_id
        )
        VALUES (?, ?, ?)
      `).run(
        'game-30549',
        'boardgamegeek',
        '30549',
      )

      assert.throws(
        () => {
          db.prepare(`
            INSERT INTO catalogue_entries (
              game_id,
              availability_status,
              imported_at
            )
            VALUES (?, ?, ?)
          `).run(
            'game-30549',
            'discontinued-maybe',
            '2026-10-27T00:00:00Z',
          )
        },
        /CHECK constraint failed/,
      )
    } finally {
      db.close()
    }
  },
)