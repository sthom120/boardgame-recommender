const fs = require('node:fs')
const path = require('node:path')

const {
  DatabaseSync,
} = require('node:sqlite')

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

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  openCatalogueDatabase,
}