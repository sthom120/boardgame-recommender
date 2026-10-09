const {
  fetchBggGames,
} = require('../integrations/bgg/bggGames')

// -----------------------------------------------------------------------------
// Controlled Shuffled BoardGameGeek catalogue
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// BoardGameGeek game data source
// -----------------------------------------------------------------------------

function createBggGameDataSource({
  ids = DEFAULT_BGG_GAME_IDS,
  fetchGamesImpl = fetchBggGames,
} = {}) {
  return {
    async getGames() {
      return fetchGamesImpl(ids)
    },
  }
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  createBggGameDataSource,
  DEFAULT_BGG_GAME_IDS,
}