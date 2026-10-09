const test = require('node:test')
const assert = require('node:assert/strict')

const {
  createRecommendationService,
} = require('../services/recommendationService')

// -----------------------------------------------------------------------------
// Recommendation service data-source boundary
// -----------------------------------------------------------------------------

test('gets candidate games from the supplied data source', async () => {
  const games = [
    {
      id: 'game-test-1',
    },
  ]

  let getGamesCalls = 0

  const gameDataSource = {
    getGames: async () => {
      getGamesCalls += 1
      return games
    },
  }

  const recommendGamesImpl = (
    receivedGames,
    receivedAnswers,
  ) => ({
    receivedGames,
    receivedAnswers,
  })

  const service =
    createRecommendationService({
      gameDataSource,
      recommendGamesImpl,
    })

  const answers = {
    players: 2,
    time: 'up-to-60',
    complexity: 'some-strategy',
    mood: ['relaxed'],
    style: ['building-collecting'],
    youngestPlayerAge: 12,
    contentPreference: 'no-preference',
  }

  const result =
    await service.getRecommendations(
      answers,
    )

  assert.equal(getGamesCalls, 1)

  assert.equal(
    result.receivedGames,
    games,
  )

  assert.equal(
    result.receivedAnswers,
    answers,
  )
})

test('rejects a data source that does not provide getGames', () => {
  assert.throws(
    () =>
      createRecommendationService({
        gameDataSource: {},
        recommendGamesImpl: () => {},
      }),
    /game data source must provide getGames/,
  )
})

test('uses the real recommendation engine by default', async () => {
  const gameDataSource = {
    getGames: async () => [
      {
        id: 'game-test-1',

        source: {
          provider: 'boardgamegeek',
          externalId: '12345',
        },

        title: 'Test Game',
        description: 'A test board game.',

        images: {
          thumbnailUrl: null,
          imageUrl: null,
        },

        playerRange: {
          min: 2,
          max: 4,
        },

        playTime: {
          minMinutes: 30,
          maxMinutes: 45,
        },

        age: {
          publisherMinimum: 8,
          communityPoll: [],
        },

        complexity: {
          average: 2,
        },

        playerCountPoll: [
          {
            players: '2',
            bestVotes: 50,
            recommendedVotes: 0,
            notRecommendedVotes: 0,
          },
        ],

        mechanics: [
          'Set Collection',
        ],

        categories: [],

        ratings: {
          bayesianAverage: 7,
          usersRated: 100,
        },

        relationships: {
          baseGameIds: [],
        },

        content: {
          classification: 'unknown',
        },
      },
    ],
  }

  const service =
    createRecommendationService({
      gameDataSource,
    })

  const answers = {
    players: 2,
    time: 'up-to-60',
    complexity: 'some-strategy',
    mood: ['no-preference'],
    style: ['building-collecting'],
    youngestPlayerAge: 12,
    contentPreference: 'no-preference',
  }

  const result =
    await service.getRecommendations(
      answers,
    )

  assert.equal(
    result.recommendationCount,
    1,
  )

  assert.equal(
    result.recommendations[0].title,
    'Test Game',
  )

  assert.equal(
    'internalScore' in
      result.recommendations[0],
    false,
  )
})