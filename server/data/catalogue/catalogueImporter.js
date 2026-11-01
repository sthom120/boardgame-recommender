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
  importedAt = new Date().toISOString(),
}) {
  let importedCount = 0

  for (
    let start = 0;
    start < ids.length;
    start += BGG_BATCH_SIZE
  ) {
    const batchIds = ids.slice(
      start,
      start + BGG_BATCH_SIZE,
    )

    const batchNumber =
      start / BGG_BATCH_SIZE + 1

    let games

    try {
      games = await fetchGamesImpl(batchIds)
    } catch (cause) {
      const error = new Error(
        `Catalogue import failed at batch ${batchNumber}`,
        { cause },
      )

      error.failedBatchNumber = batchNumber
      error.importedCount = importedCount

      throw error
    }

    for (const game of games) {
      repository.upsertGame(game, {
        importedAt,
      })

      importedCount += 1
    }
  }
}


// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  importCatalogue,
}