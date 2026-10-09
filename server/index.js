require('dotenv').config()

const {
  createApp,
} = require('./app')

const {
  createBggGameDataSource,
} = require('./data/bggGameDataSource')

const {
  createRecommendationService,
} = require('./services/recommendationService')

// -----------------------------------------------------------------------------
// Production dependencies
// -----------------------------------------------------------------------------

const gameDataSource =
  createBggGameDataSource()

const recommendationService =
  createRecommendationService({
    gameDataSource,
  })

const app =
  createApp({
    recommendationService,
  })

// -----------------------------------------------------------------------------
// Server startup
// -----------------------------------------------------------------------------

const PORT =
  process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`,
  )
})