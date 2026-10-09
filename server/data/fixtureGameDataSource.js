const {
  loadMockGames,
} = require('./loadMockGames')

// -----------------------------------------------------------------------------
// Fixture game data source
// -----------------------------------------------------------------------------

function createFixtureGameDataSource({
  loadGamesImpl = loadMockGames,
} = {}) {
  return {
    async getGames() {
      return loadGamesImpl()
    },
  }
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  createFixtureGameDataSource,
}