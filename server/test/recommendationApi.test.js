const test = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')
const { once } = require('node:events')

const {
  createApp,
} = require('../app')

// -----------------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------------

async function startTestServer(app) {
  const server = http.createServer(app)

  server.listen(
    0,
    '127.0.0.1',
  )

  await once(
    server,
    'listening',
  )

  return server
}

// -----------------------------------------------------------------------------
// Recommendation API
// -----------------------------------------------------------------------------

test('passes a valid questionnaire request to the recommendation service', async (t) => {
  const answers = {
    players: 2,
    time: 'up-to-60',
    complexity: 'some-strategy',
    mood: ['relaxed'],
    style: ['building-collecting'],
    youngestPlayerAge: 12,
    contentPreference: 'no-preference',
  }

  const expectedResponse = {
    resultState: 'limited-matches',
    recommendationCount: 1,
    recommendations: [
      {
        rank: 1,
        gameId: 'game-test-1',
        title: 'Test Game',
      },
    ],
  }

  let receivedAnswers = null

  const recommendationService = {
    getRecommendations: async (
      requestAnswers,
    ) => {
      receivedAnswers =
        requestAnswers

      return expectedResponse
    },
  }

  const app =
    createApp({
      recommendationService,
    })

  const server =
    await startTestServer(app)

  t.after(() => {
    server.close()
  })

  const address =
    server.address()

  const response =
    await fetch(
      `http://127.0.0.1:${address.port}/api/recommendations`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify(
          answers,
        ),
      },
    )

  assert.equal(
    response.status,
    200,
  )

  assert.deepEqual(
    receivedAnswers,
    answers,
  )

  assert.deepEqual(
    await response.json(),
    expectedResponse,
  )
})

test('returns a safe 503 response when recommendations are unavailable', async (t) => {
  const recommendationService = {
    getRecommendations: async () => {
      const error =
        new Error('BGG API request failed with status 503')

      error.code =
        'RECOMMENDATION_UNAVAILABLE'

      throw error
    },
  }

  const app =
    createApp({
      recommendationService,
    })

  const server =
    await startTestServer(app)

  t.after(() => {
    server.close()
  })

  const address =
    server.address()

  const response =
    await fetch(
      `http://127.0.0.1:${address.port}/api/recommendations`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          players: 2,
          time: 'up-to-60',
          complexity: 'some-strategy',
          mood: ['relaxed'],
          style: ['building-collecting'],
          youngestPlayerAge: 12,
          contentPreference:
            'no-preference',
        }),
      },
    )

  assert.equal(
    response.status,
    503,
  )

  assert.deepEqual(
    await response.json(),
    {
      error:
        'recommendation_unavailable',

      message:
        'Recommendations are temporarily unavailable. Please try again shortly.',
    },
  )
})