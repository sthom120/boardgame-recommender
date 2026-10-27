const {
  fetchBggGames,
} = require(
  '../../integrations/bgg/bggGames',
)

// -----------------------------------------------------------------------------
// Catalogue import configuration
// -----------------------------------------------------------------------------

const BGG_BATCH_SIZE = 20

// -----------------------------------------------------------------------------
// Catalogue importer
// -----------------------------------------------------------------------------

async function importCatalogue({
  ids,
  repository,
  fetchGamesImpl = fetchBggGames,
  importedAt =
    new Date().toISOString(),
}) {
  for (
    let start = 0;
    start < ids.length;
    start += BGG_BATCH_SIZE
  ) {
    const batchIds =
      ids.slice(
        start,
        start + BGG_BATCH_SIZE,
      )

    const games =
      await fetchGamesImpl(
        batchIds,
      )

    for (const game of games) {
      repository.upsertGame(
        game,
        {
          importedAt,
        },
      )
    }
  }
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  importCatalogue,
}