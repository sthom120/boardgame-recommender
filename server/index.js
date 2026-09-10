require('dotenv').config()

const express = require('express')
const { loadMockGames } = require('./data/loadMockGames')
const {
  buildMockRecommendationResponse,
} = require('./services/mockRecommendationResponse')
const {
  validateRecommendationRequest,
} = require('./validation/recommendationRequest')

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Board Game Recommender API is running',
  })
})

app.post('/api/recommendations', (req, res, next) => {
  const validation = validateRecommendationRequest(req.body)

  if (!validation.valid) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'The recommendation request contains invalid or missing values.',
      details: validation.errors,
    })
  }

  try {
    const games = loadMockGames()
    const response = buildMockRecommendationResponse(games)

    return res.json(response)
  } catch (error) {
    return next(error)
  }
})

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'invalid_json',
      message: 'The request body contains invalid JSON.',
    })
  }

  console.error(error)

  return res.status(500).json({
    error: 'server_error',
    message: 'The recommendation service could not complete the request.',
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
