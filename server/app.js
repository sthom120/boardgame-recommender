const express = require('express')

const {
  validateRecommendationRequest,
} = require('./validation/recommendationRequest')

// -----------------------------------------------------------------------------
// Express application
// -----------------------------------------------------------------------------

function createApp({
  recommendationService,
}) {
  if (
    !recommendationService ||
    typeof recommendationService.getRecommendations !==
      'function'
  ) {
    throw new Error(
      'recommendation service must provide getRecommendations',
    )
  }

  const app = express()

  app.use(express.json())

  // ---------------------------------------------------------------------------
  // Health endpoint
  // ---------------------------------------------------------------------------

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message:
        'Board Game Recommender API is running',
    })
  })

  // ---------------------------------------------------------------------------
  // Recommendation endpoint
  // ---------------------------------------------------------------------------

  app.post(
    '/api/recommendations',
    async (req, res, next) => {
      const validation =
        validateRecommendationRequest(
          req.body,
        )

      if (!validation.valid) {
        return res.status(400).json({
          error: 'validation_error',
          message:
            'The recommendation request contains invalid or missing values.',
          details: validation.errors,
        })
      }

      try {
        const response =
          await recommendationService.getRecommendations(
            req.body,
          )

        return res.json(response)
      } catch (error) {
        return next(error)
      }
    },
  )

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------

  app.use((error, req, res, next) => {
    if (
      error instanceof SyntaxError &&
      error.status === 400 &&
      'body' in error
    ) {
      return res.status(400).json({
        error: 'invalid_json',
        message:
          'The request body contains invalid JSON.',
      })
    }

    console.error(error)

    return res.status(500).json({
      error: 'server_error',
      message:
        'The recommendation service could not complete the request.',
    })
  })

  return app
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  createApp,
}