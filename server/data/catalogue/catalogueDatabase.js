const fs = require('node:fs')
const path = require('node:path')

const {
  DatabaseSync,
} = require('node:sqlite')

const {
  getCatalogueDatabasePath,
} = require(
  '../../config/catalogueConfig',
)

// -----------------------------------------------------------------------------
// Catalogue schema
// -----------------------------------------------------------------------------

const schema = fs.readFileSync(
  path.join(
    __dirname,
    'schema.sql',
  ),
  'utf8',
)

// -----------------------------------------------------------------------------
// Catalogue database
// -----------------------------------------------------------------------------

function openCatalogueDatabase({
  databasePath,
}) {
  const db =
    new DatabaseSync(
      databasePath,
    )

  try {
    db.exec(schema)

    return db
  } catch (error) {
    db.close()

    throw error
  }
}

function openConfiguredCatalogueDatabase({
  env = process.env,
} = {}) {
  const databasePath =
    getCatalogueDatabasePath(env)

  return openCatalogueDatabase({
    databasePath,
  })
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  openCatalogueDatabase,
  openConfiguredCatalogueDatabase,
}