const test = require('node:test')
const assert = require('node:assert/strict')

const {
  createFixtureGameDataSource,
} = require('../data/fixtureGameDataSource')

// -----------------------------------------------------------------------------
// Fixture game data source
// -----------------------------------------------------------------------------

test('returns games from the fixture loader', async () => {
  const expectedGames = [
    {
      id: 'game-test-1',
    },
  ]

  let loadGamesCalls = 0

  const loadGamesImpl = () => {
    loadGamesCalls += 1
    return expectedGames
  }

  const dataSource =
    createFixtureGameDataSource({
      loadGamesImpl,
    })

  const games =
    await dataSource.getGames()

  assert.equal(loadGamesCalls, 1)
  assert.equal(games, expectedGames)
})