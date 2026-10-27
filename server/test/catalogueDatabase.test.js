const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {
  openCatalogueDatabase,
} = require(
  '../data/catalogue/catalogueDatabase',
)

// -----------------------------------------------------------------------------
// Catalogue database
// -----------------------------------------------------------------------------

test(
  'opens an initialized catalogue database',
  () => {
    const db =
      openCatalogueDatabase({
        databasePath: ':memory:',
      })

    try {
      const tables = db
        .prepare(`
          SELECT name
          FROM sqlite_master
          WHERE type = 'table'
            AND name IN (
              'games',
              'catalogue_entries'
            )
          ORDER BY name
        `)
        .all()
        .map((row) => row.name)

      assert.deepEqual(
        tables,
        [
          'catalogue_entries',
          'games',
        ],
      )
    } finally {
      db.close()
    }
  },
)

test(
  'persists catalogue data in a file-backed database',
  () => {
    const tempDirectory =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'shuffled-catalogue-',
        ),
      )

    const databasePath =
      path.join(
        tempDirectory,
        'catalogue.sqlite',
      )

    try {
      const firstConnection =
        openCatalogueDatabase({
          databasePath,
        })

      firstConnection
        .prepare(`
          INSERT INTO games (
            id,
            source_provider,
            source_external_id
          )
          VALUES (?, ?, ?)
        `)
        .run(
          'game-30549',
          'boardgamegeek',
          '30549',
        )

      firstConnection.close()

      const secondConnection =
        openCatalogueDatabase({
          databasePath,
        })

      try {
        const game =
  secondConnection
    .prepare(`
      SELECT id
      FROM games
      WHERE id = ?
    `)
    .get(
      'game-30549',
    )

assert.equal(
  game.id,
  'game-30549',
)
      } finally {
        secondConnection.close()
      }
    } finally {
      fs.rmSync(
        tempDirectory,
        {
          recursive: true,
          force: true,
        },
      )
    }
  },
)