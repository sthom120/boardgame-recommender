const test = require('node:test')
const assert = require('node:assert/strict')

const {
  createBggGameDataSource,
} = require('../data/bggGameDataSource')

// -----------------------------------------------------------------------------
// BoardGameGeek game data source
// -----------------------------------------------------------------------------

test('fetches normalized games for the controlled BGG catalogue', async () => {
  const ids = [
    '266192',
    '9209',
  ]

  const expectedGames = [
    {
      id: 'game-266192',
    },
    {
      id: 'game-9209',
    },
  ]

  let receivedIds = null

  const fetchGamesImpl = async (requestedIds) => {
    receivedIds = requestedIds
    return expectedGames
  }

  const dataSource =
    createBggGameDataSource({
      ids,
      fetchGamesImpl,
    })

  const games =
    await dataSource.getGames()

  assert.deepEqual(
    receivedIds,
    ids,
  )

  assert.equal(
    games,
    expectedGames,
  )
})

test('uses the controlled Shuffled BGG catalogue by default', async () => {
  let receivedIds = null

  const fetchGamesImpl = async (requestedIds) => {
    receivedIds = requestedIds
    return []
  }

  const dataSource =
    createBggGameDataSource({
      fetchGamesImpl,
    })

  await dataSource.getGames()

  assert.deepEqual(
    receivedIds,
    [
      '178900',
      '9209',
      '266192',
      '224517',
      '30549',
      '163412',
      '306735',
      '254640',
      '41010',
      '129622',
      '233078',
      '68448',
      '822',
      '410201',
      '290448',
    ],
  )
})

test('translates a temporary BGG outage into a recommendation unavailable error', async () => {
  const fetchGamesImpl = async () => {
    const error =
      new Error(
        'BGG API request failed with status 503',
      )

    error.code =
      'BGG_UNAVAILABLE'

    throw error
  }

  const dataSource =
    createBggGameDataSource({
      fetchGamesImpl,
    })

  await assert.rejects(
    () =>
      dataSource.getGames(),
    (error) => {
      assert.equal(
        error.code,
        'RECOMMENDATION_UNAVAILABLE',
      )

      return true
    },
  )
})