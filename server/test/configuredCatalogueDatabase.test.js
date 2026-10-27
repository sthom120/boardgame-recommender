const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {
  openConfiguredCatalogueDatabase,
} = require(
  '../data/catalogue/catalogueDatabase',
)

// -----------------------------------------------------------------------------
// Configured catalogue database
// -----------------------------------------------------------------------------

test(
  'opens the catalogue database at the configured path',
  () => {
    const tempDirectory =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'shuffled-configured-catalogue-',
        ),
      )

    const databasePath =
      path.join(
        tempDirectory,
        'custom-catalogue.sqlite',
      )

    try {
      const db =
        openConfiguredCatalogueDatabase({
          env: {
            CATALOGUE_DB_PATH:
              databasePath,
          },
        })

      db.close()

      assert.equal(
        fs.existsSync(databasePath),
        true,
      )
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