const {
  recommendGames,
} = require('./recommendationEngine')

// -----------------------------------------------------------------------------
// Recommendation service
// -----------------------------------------------------------------------------

function createRecommendationService({
  gameDataSource,
  recommendGamesImpl = recommendGames,
}) {
  if (
    !gameDataSource ||
    typeof gameDataSource.getGames !== 'function'
  ) {
    throw new Error(
      'game data source must provide getGames',
    )
  }

  if (typeof recommendGamesImpl !== 'function') {
    throw new Error(
      'recommendGamesImpl must be a function',
    )
  }

  async function getRecommendations(answers) {
    const games =
      await gameDataSource.getGames()

    return recommendGamesImpl(
      games,
      answers,
    )
  }

  return {
    getRecommendations,
  }
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  createRecommendationService,
}