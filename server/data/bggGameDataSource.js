const {
  fetchBggGames,
} = require('../integrations/bgg/bggGames')

const DEFAULT_BGG_GAME_IDS = [
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
]

function createBggGameDataSource({
  ids = DEFAULT_BGG_GAME_IDS,
  fetchGamesImpl = fetchBggGames,
} = {}) {
  return {
    async getGames() {
      try {
        return await fetchGamesImpl(ids)
      } catch (error) {
        if (
          error.code ===
          'BGG_UNAVAILABLE'
        ) {
          const unavailableError =
            new Error(
              'Recommendation data is temporarily unavailable',
            )

          unavailableError.code =
            'RECOMMENDATION_UNAVAILABLE'

          throw unavailableError
        }

        throw error
      }
    },
  }
}

module.exports = {
  createBggGameDataSource,
  DEFAULT_BGG_GAME_IDS,
}