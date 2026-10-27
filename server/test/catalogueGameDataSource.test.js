const test = require('node:test')
const assert = require('node:assert/strict')

const {
  createCatalogueGameDataSource,
} = require(
  '../data/catalogueGameDataSource',
)

// -----------------------------------------------------------------------------
// Catalogue game data source
// -----------------------------------------------------------------------------

test(
  'returns included games from the catalogue repository',
  async () => {
    const games = [
      {
        id: 'game-30549',
        title: 'Pandemic',
      },
    ]

    let getIncludedGamesCalls = 0

    const repository = {
      getIncludedGames() {
        getIncludedGamesCalls += 1

        return games
      },
    }

    const dataSource =
      createCatalogueGameDataSource({
        repository,
      })

    const result =
      await dataSource.getGames()

    assert.equal(
      getIncludedGamesCalls,
      1,
    )

    assert.equal(
      result,
      games,
    )
  },
)

test(
  'rejects a repository without getIncludedGames',
  () => {
    assert.throws(
      () =>
        createCatalogueGameDataSource({
          repository: {},
        }),
      /catalogue repository must provide getIncludedGames/,
    )
  },
)