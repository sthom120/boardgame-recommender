const test = require('node:test')
const assert = require('node:assert/strict')

const {
  fetchBggGames,
} = require('../integrations/bgg/bggGames')

// -----------------------------------------------------------------------------
// Normalized BGG game boundary
// -----------------------------------------------------------------------------

test('fetches BGG data and returns normalized app-owned game records', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    text: async () => `
      <items>
        <item type="boardgame" id="266192">
          <name
            type="primary"
            value="Wingspan"
          />
          <yearpublished value="2019" />
          <minplayers value="1" />
          <maxplayers value="5" />
          <minplaytime value="40" />
          <maxplaytime value="70" />
          <minage value="10" />
        </item>
      </items>
    `,
  })

  const games = await fetchBggGames(
    ['266192'],
    {
      token: 'test-token',
      fetchImpl,
      cache: new Map(),
      requestState: {
        lastRequestAt: null,
      },
    },
  )

  assert.equal(games.length, 1)

  assert.deepEqual(
    games[0].source,
    {
      provider: 'boardgamegeek',
      externalId: '266192',
    },
  )

  assert.equal(
    games[0].title,
    'Wingspan',
  )

  assert.deepEqual(
    games[0].playerRange,
    {
      min: 1,
      max: 5,
    },
  )
})

test('uses a shared cache for normal BGG game requests', async () => {
  let fetchCalls = 0

  const fetchImpl = async () => {
    fetchCalls += 1

    return {
      ok: true,
      status: 200,
      text: async () => `
        <items>
          <item type="boardgame" id="999001">
            <name
              type="primary"
              value="Cache Test Game"
            />
          </item>
        </items>
      `,
    }
  }

  await fetchBggGames(
    ['999001'],
    {
      token: 'test-token',
      fetchImpl,
      minimumRequestIntervalMs: 0,
    },
  )

  await fetchBggGames(
    ['999001'],
    {
      token: 'test-token',
      fetchImpl,
    },
  )

  assert.equal(fetchCalls, 1)
})