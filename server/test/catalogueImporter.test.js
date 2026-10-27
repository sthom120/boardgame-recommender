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
