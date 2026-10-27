const test = require('node:test')
const assert = require('node:assert/strict')

const {
  importCatalogue,
} = require(
  '../data/catalogue/catalogueImporter',
)

// -----------------------------------------------------------------------------
// Catalogue importer
// -----------------------------------------------------------------------------

test(
  'imports BGG games in batches of no more than twenty',
  async () => {
    const ids = Array.from(
      {
        length: 45,
      },
      (_, index) =>
        String(index + 1),
    )

    const requestedBatches = []
    const importedGames = []

    const fetchGamesImpl =
      async (batchIds) => {
        requestedBatches.push(
          batchIds,
        )

        return batchIds.map(
          (id) => ({
            id: `game-${id}`,
          }),
        )
      }

    const repository = {
      upsertGame(
        game,
        {
          importedAt,
        },
      ) {
        importedGames.push({
          game,
          importedAt,
        })
      },
    }

    await importCatalogue({
      ids,
      repository,
      fetchGamesImpl,
      importedAt:
        '2026-10-27T00:00:00Z',
    })

    assert.deepEqual(
      requestedBatches.map(
        (batch) => batch.length,
      ),
      [
        20,
        20,
        5,
      ],
    )

    assert.equal(
      importedGames.length,
      45,
    )

    assert.equal(
      importedGames[0]
        .importedAt,
      '2026-10-27T00:00:00Z',
    )

    assert.equal(
      importedGames[44]
        .game.id,
      'game-45',
    )
  },
)

test(
  'fetches BGG batches sequentially',
  async () => {
    const ids = Array.from(
      {
        length: 25,
      },
      (_, index) =>
        String(index + 1),
    )

    let activeRequests = 0
    let maximumActiveRequests = 0

    const fetchGamesImpl =
      async (batchIds) => {
        activeRequests += 1

        maximumActiveRequests =
          Math.max(
            maximumActiveRequests,
            activeRequests,
          )

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              10,
            ),
        )

        activeRequests -= 1

        return batchIds.map(
          (id) => ({
            id: `game-${id}`,
          }),
        )
      }

    const repository = {
      upsertGame() {},
    }

    await importCatalogue({
      ids,
      repository,
      fetchGamesImpl,
      importedAt:
        '2026-10-27T00:00:00Z',
    })

    assert.equal(
      maximumActiveRequests,
      1,
    )
  },
)