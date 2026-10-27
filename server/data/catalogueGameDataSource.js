// -----------------------------------------------------------------------------
// Catalogue-backed game data source
// -----------------------------------------------------------------------------

function createCatalogueGameDataSource({
  repository,
}) {
  if (
    !repository ||
    typeof repository.getIncludedGames !==
      'function'
  ) {
    throw new Error(
      'catalogue repository must provide getIncludedGames',
    )
  }

  return {
    async getGames() {
      return repository.getIncludedGames()
    },
  }
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  createCatalogueGameDataSource,
}