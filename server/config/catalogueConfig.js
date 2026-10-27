const path = require('node:path')

// -----------------------------------------------------------------------------
// Catalogue configuration
// -----------------------------------------------------------------------------

function getCatalogueDatabasePath(
  env = process.env,
) {
  if (env.CATALOGUE_DB_PATH) {
    return env.CATALOGUE_DB_PATH
  }

  return path.join(
    __dirname,
    '..',
    'data',
    'catalogue',
    'catalogue.sqlite',
  )
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  getCatalogueDatabasePath,
}