const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const {
  getCatalogueDatabasePath,
} = require(
  '../config/catalogueConfig',
)

// -----------------------------------------------------------------------------
// Catalogue configuration
// -----------------------------------------------------------------------------

test(
  'uses CATALOGUE_DB_PATH when provided',
  () => {
    const result =
      getCatalogueDatabasePath({
        CATALOGUE_DB_PATH:
          'C:\\data\\shuffled.sqlite',
      })

    assert.equal(
      result,
      'C:\\data\\shuffled.sqlite',
    )
  },
)

test(
  'uses the default catalogue path when no environment value is provided',
  () => {
    const result =
      getCatalogueDatabasePath({})

    assert.equal(
      result,
      path.join(
        __dirname,
        '..',
        'data',
        'catalogue',
        'catalogue.sqlite',
      ),
    )
  },
)