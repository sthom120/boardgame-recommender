const test = require('node:test')
const assert = require('node:assert/strict')
const mockGames = require('../../fixtures/mock-games.json')

const {
  checkEligibility,
  scorePlayerCountSuitability,
  scorePlayTime,
  scoreComplexity,
  scoreMood,
  scoreStyle,
  calculateWeightedScore,
  getMatchLabel,
  compareRecommendations,
  generateCaveats,
  generateMatchReasons,
    recommendGames,
} = require('../services/recommendationEngine')

test('includes a standalone game that supports the selected player count', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: true,
    reason: null,
  })
})

test('excludes an expansion', () => {
  const game = {
    relationships: {
      baseGameIds: ['game-266192'],
    },
    playerRange: {
      min: 1,
      max: 5,
    },
    age: {
      publisherMinimum: 8,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'expansion',
  })
})

test('excludes a game when the selected player count is too low', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 3,
      max: 6,
    },
    age: {
      publisherMinimum: 8,
    },
  }

  const answers = {
    players: 2,
    youngestPlayerAge: 10,
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'player-count-out-of-range',
  })
})

test('excludes a game when the selected player count is too high', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
  }

  const answers = {
    players: 5,
    youngestPlayerAge: 10,
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'player-count-out-of-range',
  })
})

test('excludes a game when the official player range is unavailable', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: null,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'player-range-unavailable',
  })
})

test('includes a game when the youngest player meets the publisher minimum age', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 10,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: true,
    reason: null,
  })
})

test('excludes a game when the youngest player is below the publisher minimum age', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 12,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'player-too-young',
  })
})

test('excludes a game when publisher age guidance is unavailable', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: null,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'age-unavailable',
  })
})

test('includes a family-friendly game when family-friendly content is required', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    content: {
      classification: 'family-friendly',
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    contentPreference: 'family-friendly',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: true,
    reason: null,
  })
})

test('excludes mature content when family-friendly content is required', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    content: {
      classification: 'mature',
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    contentPreference: 'family-friendly',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'content-not-family-friendly',
  })
})

test('excludes unknown content when family-friendly content is required', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    content: {
      classification: 'unknown',
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    contentPreference: 'family-friendly',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'content-not-family-friendly',
  })
})

test('does not filter mature content when mature content is allowed', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    content: {
      classification: 'mature',
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    contentPreference: 'mature-okay',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: true,
    reason: null,
  })
})

test('does not filter unknown content when there is no content preference', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    content: {
      classification: 'unknown',
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    contentPreference: 'no-preference',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: true,
    reason: null,
  })
})

test('includes a game within the selected play-time budget', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    playTime: {
      maxMinutes: 45,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    time: 'up-to-60',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: true,
    reason: null,
  })
})

test('includes a game up to 10 percent over the selected play-time budget', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    playTime: {
      maxMinutes: 65,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    time: 'up-to-60',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: true,
    reason: null,
  })
})

test('excludes a game more than 10 percent over the selected play-time budget', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    playTime: {
      maxMinutes: 67,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    time: 'up-to-60',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'play-time-too-long',
  })
})

test('excludes a game with missing play time when a time budget is selected', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    playTime: {
      maxMinutes: null,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    time: 'up-to-60',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: false,
    reason: 'play-time-unavailable',
  })
})

test('does not apply a play-time limit when there is no time preference', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 2,
      max: 4,
    },
    age: {
      publisherMinimum: 8,
    },
    playTime: {
      maxMinutes: 240,
    },
  }

  const answers = {
    players: 3,
    youngestPlayerAge: 10,
    time: 'no-preference',
  }

  assert.deepEqual(checkEligibility(game, answers), {
    eligible: true,
    reason: null,
  })
})

test('calculates player suitability from a high-confidence poll', () => {
  const game = {
    playerCountPoll: [
      {
        players: '3',
        bestVotes: 100,
        recommendedVotes: 80,
        notRecommendedVotes: 20,
      },
    ],
  }

  const score = scorePlayerCountSuitability(game, 3)

  assert.equal(score, 0.8)
})

test('pulls a low-confidence player poll toward the neutral score', () => {
  const game = {
    playerCountPoll: [
      {
        players: '3',
        bestVotes: 10,
        recommendedVotes: 0,
        notRecommendedVotes: 0,
      },
    ],
  }

  const score = scorePlayerCountSuitability(game, 3)

  assert.ok(Math.abs(score - 0.6) < 0.000001)
})

test('returns a neutral player score when no poll data exists', () => {
  const game = {
    playerCountPoll: [],
  }

  assert.equal(scorePlayerCountSuitability(game, 3), 0.5)
})

test('supports grouped player-count poll entries such as 5+', () => {
  const game = {
    playerCountPoll: [
      {
        players: '5+',
        bestVotes: 40,
        recommendedVotes: 10,
        notRecommendedVotes: 0,
      },
    ],
  }

  const score = scorePlayerCountSuitability(game, 6)

  assert.equal(score, 0.95)
})


test('includes a game exactly ten percent over the selected play-time budget', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 1,
      max: 5,
    },
    playTime: {
      maxMinutes: 66,
    },
    age: {
      publisherMinimum: 10,
    },
    content: {
      classification: 'family-friendly',
    },
  }

  const result = checkEligibility(game, {
    players: 4,
    time: 'up-to-60',
    youngestPlayerAge: 12,
    contentPreference: 'family-friendly',
  })

  assert.equal(result.eligible, true)
  assert.equal(
    scorePlayTime(game, 'up-to-60'),
    0.5,
  )
})

test('keeps a game with missing play-time data when more than two hours is selected', () => {
  const game = {
    relationships: {
      baseGameIds: [],
    },
    playerRange: {
      min: 1,
      max: 5,
    },
    playTime: {
      maxMinutes: null,
    },
    age: {
      publisherMinimum: 10,
    },
    content: {
      classification: 'family-friendly',
    },
  }

  const result = checkEligibility(game, {
    players: 4,
    time: 'over-120',
    youngestPlayerAge: 12,
    contentPreference: 'family-friendly',
  })

  assert.equal(result.eligible, true)
  assert.equal(
    scorePlayTime(game, 'over-120'),
    1,
  )
})

test('prefers an exact player-count poll row over an open-ended row', () => {
  const game = {
    playerCountPoll: [
      {
        players: '7+',
        bestVotes: 50,
        recommendedVotes: 0,
        notRecommendedVotes: 0,
      },
      {
        players: '8',
        bestVotes: 0,
        recommendedVotes: 50,
        notRecommendedVotes: 0,
      },
    ],
  }

  const score = scorePlayerCountSuitability(game, 8)

  assert.equal(score, 0.75)
})

test('uses the most specific applicable open-ended player-count poll row', () => {
  const game = {
    playerCountPoll: [
      {
        players: '7+',
        bestVotes: 50,
        recommendedVotes: 0,
        notRecommendedVotes: 0,
      },
      {
        players: '8+',
        bestVotes: 0,
        recommendedVotes: 50,
        notRecommendedVotes: 0,
      },
    ],
  }

  const score = scorePlayerCountSuitability(game, 9)

  assert.equal(score, 0.75)
})

test('gives a full time score when the game fits within the selected budget', () => {
  const game = {
    playTime: {
      maxMinutes: 45,
    },
  }

  assert.equal(scorePlayTime(game, 'up-to-60'), 1)
})

test('gives a partial time score when the game is up to 10 percent over budget', () => {
  const game = {
    playTime: {
      maxMinutes: 65,
    },
  }

  assert.equal(scorePlayTime(game, 'up-to-60'), 0.5)
})

test('gives no time score when the game is more than 10 percent over budget', () => {
  const game = {
    playTime: {
      maxMinutes: 67,
    },
  }

  assert.equal(scorePlayTime(game, 'up-to-60'), 0)
})

test('gives a full time score when more than 2 hours is selected', () => {
  const game = {
    playTime: {
      maxMinutes: 240,
    },
  }

  assert.equal(scorePlayTime(game, 'over-120'), 1)
})

test('gives a full time score for over-120 even when play-time data is missing', () => {
  const game = {
    playTime: {
      maxMinutes: null,
    },
  }

  assert.equal(scorePlayTime(game, 'over-120'), 1)
})

test('removes time from scoring when there is no time preference', () => {
  const game = {
    playTime: {
      maxMinutes: 90,
    },
  }

  assert.equal(scorePlayTime(game, 'no-preference'), null)
})

test('scores complexity against the documented complexity bands', () => {
  const scenarios = [
    {
      preference: 'light',
      average: 1.5,
      expected: 1,
    },
    {
      preference: 'light',
      average: 2,
      expected: 0.5,
    },
    {
      preference: 'light',
      average: 3,
      expected: 0,
    },
    {
      preference: 'some-strategy',
      average: 2.25,
      expected: 1,
    },
    {
      preference: 'some-strategy',
      average: 2.75,
      expected: 0.5,
    },
    {
      preference: 'moderate',
      average: 3,
      expected: 1,
    },
    {
      preference: 'moderate',
      average: 3.75,
      expected: 0.5,
    },
    {
      preference: 'deep',
      average: 4,
      expected: 1,
    },
    {
      preference: 'deep',
      average: 3.25,
      expected: 0.5,
    },
  ]

  for (const scenario of scenarios) {
    const game = {
      complexity: {
        average: scenario.average,
      },
    }

    assert.equal(
      scoreComplexity(game, scenario.preference),
      scenario.expected,
    )
  }
})

test('gives no complexity score when complexity data is missing', () => {
  const game = {
    complexity: {
      average: null,
    },
  }

  assert.equal(scoreComplexity(game, 'moderate'), 0)
})

test('removes complexity from scoring when there is no preference', () => {
  const game = {
    complexity: {
      average: 4.5,
    },
  }

  assert.equal(scoreComplexity(game, 'no-preference'), null)
})

test('gives a strong social score for a primary social mechanic', () => {
  const game = {
    mechanics: ['Communication Limits'],
    categories: [],
  }

  assert.equal(scoreMood(game, ['social']), 1)
})

test('gives a partial social score for a secondary social category', () => {
  const game = {
    mechanics: [],
    categories: ['Party Game'],
  }

  assert.equal(scoreMood(game, ['social']), 0.5)
})

test('gives a strong relaxed score to a short low-complexity game', () => {
  const game = {
    complexity: {
      average: 1.5,
    },
    playTime: {
      maxMinutes: 30,
    },
    mechanics: [],
    categories: [],
  }

  assert.equal(scoreMood(game, ['relaxed']), 1)
})

test('does not give a relaxed score when a high-conflict mechanic is present', () => {
  const game = {
    complexity: {
      average: 1.5,
    },
    playTime: {
      maxMinutes: 30,
    },
    mechanics: ['Take That'],
    categories: [],
  }

  assert.equal(scoreMood(game, ['relaxed']), 0)
})

test('uses complexity as secondary evidence for strategic mood', () => {
  const game = {
    complexity: {
      average: 3,
    },
    mechanics: [],
    categories: [],
  }

  assert.equal(scoreMood(game, ['strategic']), 0.5)
})

test('gives a partial immersive score for a thematic category', () => {
  const game = {
    mechanics: [],
    categories: ['Fantasy'],
  }

  assert.equal(scoreMood(game, ['immersive']), 0.5)
})

test('averages two selected mood scores', () => {
  const game = {
    complexity: {
      average: 3,
    },
    mechanics: ['Communication Limits'],
    categories: [],
  }

  assert.equal(
    scoreMood(game, ['social', 'strategic']),
    0.75,
  )
})

test('gives no mood score when mapped source data is missing', () => {
  const game = {}

  assert.equal(scoreMood(game, ['social']), 0)
})

test('removes mood from scoring when there is no mood preference', () => {
  const game = {
    mechanics: ['Communication Limits'],
    categories: ['Party Game'],
  }

  assert.equal(scoreMood(game, ['no-preference']), null)
})

test('gives a strong working-things-out score for a primary mechanic', () => {
  const game = {
    mechanics: ['Deduction'],
    categories: [],
  }

  assert.equal(scoreStyle(game, ['working-things-out']), 1)
})

test('gives a partial building-collecting score for a secondary mechanic', () => {
  const game = {
    mechanics: ['Hand Management'],
    categories: [],
  }

  assert.equal(scoreStyle(game, ['building-collecting']), 0.5)
})

test('gives a strong planning-managing score for worker placement', () => {
  const game = {
    mechanics: ['Worker Placement'],
    categories: [],
  }

  assert.equal(scoreStyle(game, ['planning-managing']), 1)
})

test('gives a partial talking-guessing score for a word-game category', () => {
  const game = {
    mechanics: [],
    categories: ['Word Game'],
  }

  assert.equal(scoreStyle(game, ['talking-guessing']), 0.5)
})

test('gives a strong working-together score for cooperative play', () => {
  const game = {
    mechanics: ['Cooperative Game'],
    categories: [],
  }

  assert.equal(scoreStyle(game, ['working-together']), 1)
})

test('gives a strong competing-directly score for a direct conflict mechanic', () => {
  const game = {
    mechanics: ['Take That'],
    categories: [],
  }

  assert.equal(scoreStyle(game, ['competing-directly']), 1)
})

test('gives a partial theme-story score for a thematic category', () => {
  const game = {
    mechanics: [],
    categories: ['Fantasy'],
  }

  assert.equal(scoreStyle(game, ['theme-story']), 0.5)
})

test('gives a strong quick-simple score to a short light game', () => {
  const game = {
    complexity: {
      average: 1.5,
    },
    playTime: {
      maxMinutes: 20,
    },
  }

  assert.equal(scoreStyle(game, ['quick-simple']), 1)
})

test('gives a partial quick-simple score to a slightly longer or heavier game', () => {
  const game = {
    complexity: {
      average: 2,
    },
    playTime: {
      maxMinutes: 40,
    },
  }

  assert.equal(scoreStyle(game, ['quick-simple']), 0.5)
})

test('averages two selected game-style scores', () => {
  const game = {
    mechanics: [
      'Set Collection',
      'Hand Management',
    ],
    categories: [],
  }

  assert.equal(
    scoreStyle(
      game,
      ['building-collecting', 'planning-managing'],
    ),
    0.75,
  )
})

test('gives no game-style score when mapped source data is missing', () => {
  const game = {}

  assert.equal(scoreStyle(game, ['working-things-out']), 0)
})

test('removes game style from scoring when there is no preference', () => {
  const game = {
    mechanics: ['Set Collection'],
    categories: [],
  }

  assert.equal(scoreStyle(game, ['no-preference']), null)
})

test('gives a full overall score when every active factor scores fully', () => {
  const componentScores = {
    playerCount: 1,
    time: 1,
    complexity: 1,
    mood: 1,
    style: 1,
  }

  assert.equal(calculateWeightedScore(componentScores), 1)
})

test('combines component scores using the documented factor weights', () => {
  const componentScores = {
    playerCount: 0.8,
    time: 1,
    complexity: 0.5,
    mood: 0.75,
    style: 0.5,
  }

  const score = calculateWeightedScore(componentScores)

  assert.ok(Math.abs(score - 0.725) < 0.000001)
})

test('normalises the remaining weights when preferences are inactive', () => {
  const componentScores = {
    playerCount: 0.8,
    time: 1,
    complexity: 0.5,
    mood: null,
    style: null,
  }

  const score = calculateWeightedScore(componentScores)

  assert.ok(
    Math.abs(score - (0.5 / 0.65)) < 0.000001,
  )
})

test('keeps an active zero score in the weighted calculation', () => {
  const componentScores = {
    playerCount: 1,
    time: 1,
    complexity: 0,
    mood: null,
    style: null,
  }

  const score = calculateWeightedScore(componentScores)

  assert.ok(
    Math.abs(score - (0.45 / 0.65)) < 0.000001,
  )
})

test('labels scores of 0.85 and above as an excellent match', () => {
  assert.equal(getMatchLabel(0.85), 'Excellent match')
  assert.equal(getMatchLabel(1), 'Excellent match')
})

test('labels scores from 0.70 to below 0.85 as a strong match', () => {
  assert.equal(getMatchLabel(0.7), 'Strong match')
  assert.equal(getMatchLabel(0.84), 'Strong match')
})

test('labels scores from 0.55 to below 0.70 as a good match', () => {
  assert.equal(getMatchLabel(0.55), 'Good match')
  assert.equal(getMatchLabel(0.69), 'Good match')
})

test('hides recommendations below the minimum display threshold', () => {
  assert.equal(getMatchLabel(0.549), null)
  assert.equal(getMatchLabel(0), null)
})

test('orders recommendations by highest overall score first', () => {
  const recommendations = [
    {
      id: 'game-lower',
      title: 'Lower',
      internalScore: 0.7,
    },
    {
      id: 'game-higher',
      title: 'Higher',
      internalScore: 0.8,
    },
  ]

  recommendations.sort(compareRecommendations)

  assert.equal(recommendations[0].id, 'game-higher')
})

test('treats scores as tied after rounding to four decimal places', () => {
  const recommendations = [
    {
      id: 'game-a',
      title: 'Game A',
      internalScore: 0.80004,
      componentScores: {
        playerCount: 0.7,
        time: 1,
        complexity: 1,
        mood: 1,
        style: 1,
      },
    },
    {
      id: 'game-b',
      title: 'Game B',
      internalScore: 0.80003,
      componentScores: {
        playerCount: 0.9,
        time: 1,
        complexity: 1,
        mood: 1,
        style: 1,
      },
    },
  ]

  recommendations.sort(compareRecommendations)

  assert.equal(recommendations[0].id, 'game-b')
})

test('uses the documented component order to break score ties', () => {
  const recommendations = [
    {
      id: 'game-a',
      title: 'Game A',
      internalScore: 0.8,
      componentScores: {
        playerCount: 0.8,
        time: 1,
        complexity: 1,
        mood: 1,
        style: 1,
      },
    },
    {
      id: 'game-b',
      title: 'Game B',
      internalScore: 0.8,
      componentScores: {
        playerCount: 0.9,
        time: 0.5,
        complexity: 0.5,
        mood: 0.5,
        style: 0.5,
      },
    },
  ]

  recommendations.sort(compareRecommendations)

  assert.equal(recommendations[0].id, 'game-b')
})

test('skips inactive component scores during tie-breaking', () => {
  const recommendations = [
    {
      id: 'game-a',
      title: 'Game A',
      internalScore: 0.8,
      componentScores: {
        playerCount: 0.8,
        time: null,
        complexity: 0.5,
        mood: null,
        style: null,
      },
    },
    {
      id: 'game-b',
      title: 'Game B',
      internalScore: 0.8,
      componentScores: {
        playerCount: 0.8,
        time: null,
        complexity: 1,
        mood: null,
        style: null,
      },
    },
  ]

  recommendations.sort(compareRecommendations)

  assert.equal(recommendations[0].id, 'game-b')
})

test('uses ratings, title and id as stable late tie-breakers', () => {
  const recommendations = [
    {
      id: 'game-b',
      title: 'Alpha',
      internalScore: 0.8,
      componentScores: {
        playerCount: 1,
        time: 1,
        complexity: 1,
        mood: 1,
        style: 1,
      },
      ratings: {
        bayesianAverage: null,
        usersRated: null,
      },
    },
    {
      id: 'game-a',
      title: 'Alpha',
      internalScore: 0.8,
      componentScores: {
        playerCount: 1,
        time: 1,
        complexity: 1,
        mood: 1,
        style: 1,
      },
      ratings: {
        bayesianAverage: null,
        usersRated: null,
      },
    },
  ]

  recommendations.sort(compareRecommendations)

  assert.equal(recommendations[0].id, 'game-a')
})

test('adds a player-count caveat when community suitability is below neutral', () => {
  const game = {
    age: {
      publisherMinimum: 10,
      communityPoll: [],
    },
  }

  const caveats = generateCaveats(
    game,
    {
      players: 2,
      time: 'no-preference',
      complexity: 'no-preference',
    },
    {
      playerCount: 0.4,
      time: null,
      complexity: null,
    },
    0.7,
  )

  assert.ok(
    caveats.includes(
      'Works with 2 players, but community feedback is less positive at this player count.',
    ),
  )
})

test('does not add a player-count caveat for a neutral player score', () => {
  const caveats = generateCaveats(
    {
      age: {
        publisherMinimum: 10,
        communityPoll: [],
      },
    },
    {
      players: 2,
      time: 'no-preference',
      complexity: 'no-preference',
    },
    {
      playerCount: 0.5,
      time: null,
      complexity: null,
    },
    0.7,
  )

  assert.equal(caveats.length, 0)
})

test('adds a play-time caveat when the game is within the ten-percent tolerance', () => {
  const caveats = generateCaveats(
    {
      playTime: {
        maxMinutes: 65,
      },
      age: {
        publisherMinimum: 10,
        communityPoll: [],
      },
    },
    {
      players: 4,
      time: 'up-to-60',
      complexity: 'no-preference',
    },
    {
      playerCount: 1,
      time: 0.5,
      complexity: null,
    },
    0.8,
  )

  assert.ok(
    caveats.includes(
      'This may run a little longer than your preferred 60 minutes.',
    ),
  )
})

test('adds a caveat when a partial complexity match is heavier than requested', () => {
  const caveats = generateCaveats(
    {
      complexity: {
        average: 2,
      },
      age: {
        publisherMinimum: 10,
        communityPoll: [],
      },
    },
    {
      players: 4,
      time: 'no-preference',
      complexity: 'light',
    },
    {
      playerCount: 1,
      time: null,
      complexity: 0.5,
    },
    0.8,
  )

  assert.ok(
    caveats.includes(
      'This is slightly more complex than the level you selected.',
    ),
  )
})

test('adds a caveat when a partial complexity match is lighter than requested', () => {
  const caveats = generateCaveats(
    {
      complexity: {
        average: 2.25,
      },
      age: {
        publisherMinimum: 10,
        communityPoll: [],
      },
    },
    {
      players: 4,
      time: 'no-preference',
      complexity: 'moderate',
    },
    {
      playerCount: 1,
      time: null,
      complexity: 0.5,
    },
    0.8,
  )

  assert.ok(
    caveats.includes(
      'This is slightly lighter than the level you selected.',
    ),
  )
})

test('adds an age caveat and uses the lower age when community votes are tied', () => {
  const caveats = generateCaveats(
    {
      age: {
        publisherMinimum: 12,
        communityPoll: [
          {
            age: '10',
            votes: 50,
          },
          {
            age: '8',
            votes: 50,
          },
        ],
      },
    },
    {
      players: 4,
      time: 'no-preference',
      complexity: 'no-preference',
    },
    {
      playerCount: 1,
      time: null,
      complexity: null,
    },
    0.8,
  )

  assert.ok(
    caveats.includes(
      'The publisher recommends ages 12+, while community feedback most strongly suggests ages 8+.',
    ),
  )
})

test('does not generate caveats for a game below the display threshold', () => {
  const caveats = generateCaveats(
    {
      playTime: {
        maxMinutes: 65,
      },
      age: {
        publisherMinimum: 12,
        communityPoll: [
          {
            age: '8',
            votes: 100,
          },
        ],
      },
    },
    {
      players: 2,
      time: 'up-to-60',
      complexity: 'light',
    },
    {
      playerCount: 0.2,
      time: 0.5,
      complexity: 0.5,
    },
    0.54,
  )

  assert.deepEqual(caveats, [])
})

test('uses the two strongest weighted factors as recommendation reasons', () => {
  const reasons = generateMatchReasons(
    {},
    {
      players: 4,
      time: 'up-to-60',
      complexity: 'moderate',
      mood: ['no-preference'],
      style: ['no-preference'],
    },
    {
      playerCount: 1,
      time: 1,
      complexity: 1,
      mood: null,
      style: null,
    },
  )

  assert.deepEqual(reasons, [
    'A strong fit for 4 players.',
    'Fits comfortably within your 60-minute limit.',
  ])
})

test('uses documented factor priority when weighted contributions are equal', () => {
  const reasons = generateMatchReasons(
    {},
    {
      players: 4,
      time: 'up-to-60',
      complexity: 'moderate',
      mood: ['strategic'],
      style: ['no-preference'],
    },
    {
      playerCount: 0,
      time: 1,
      complexity: 1,
      mood: 1,
      style: null,
    },
  )

  assert.deepEqual(reasons, [
    'Fits comfortably within your 60-minute limit.',
    'Matches the complexity level you selected.',
  ])
})

test('uses only one reason when only one factor reaches the explanation threshold', () => {
  const reasons = generateMatchReasons(
    {},
    {
      players: 3,
      time: 'up-to-60',
      complexity: 'moderate',
      mood: ['no-preference'],
      style: ['no-preference'],
    },
    {
      playerCount: 0.8,
      time: 0,
      complexity: 0,
      mood: null,
      style: null,
    },
  )

  assert.deepEqual(reasons, [
    'A strong fit for 3 players.',
  ])
})

test('does not use factors below 0.50 as recommendation reasons', () => {
  const reasons = generateMatchReasons(
    {},
    {
      players: 3,
      time: 'up-to-60',
      complexity: 'moderate',
      mood: ['no-preference'],
      style: ['no-preference'],
    },
    {
      playerCount: 0.49,
      time: 0.49,
      complexity: 0.49,
      mood: null,
      style: null,
    },
  )

  assert.deepEqual(reasons, [])
})

test('names only the selected mood that has matching evidence', () => {
  const game = {
    mechanics: ['Communication Limits'],
    categories: [],
  }

  const reasons = generateMatchReasons(
    game,
    {
      players: 4,
      time: 'no-preference',
      complexity: 'no-preference',
      mood: ['social', 'strategic'],
      style: ['no-preference'],
    },
    {
      playerCount: 0,
      time: null,
      complexity: null,
      mood: 0.5,
      style: null,
    },
  )

  assert.deepEqual(reasons, [
    'Matches your social and lively mood preference.',
  ])
})

test('names only the selected style that has matching evidence', () => {
  const game = {
    mechanics: ['Set Collection'],
    categories: [],
  }

  const reasons = generateMatchReasons(
    game,
    {
      players: 4,
      time: 'no-preference',
      complexity: 'no-preference',
      mood: ['no-preference'],
      style: [
        'building-collecting',
        'planning-managing',
      ],
    },
    {
      playerCount: 0,
      time: null,
      complexity: null,
      mood: null,
      style: 0.5,
    },
  )

  assert.deepEqual(reasons, [
    'Matches the building and collecting style you selected.',
  ])
})

test('runs the complete recommendation pipeline against the controlled fixtures', () => {
  const answers = {
    players: 4,
    time: 'up-to-60',
    complexity: 'some-strategy',
    mood: ['cooperative'],
    style: ['working-together'],
    youngestPlayerAge: 12,
    contentPreference: 'family-friendly',
  }

  const response = recommendGames(
    mockGames,
    answers,
  )

  assert.equal(response.resultState, 'matches')
  assert.equal(response.recommendationCount, 3)

  assert.deepEqual(
    response.recommendations.map(
      (recommendation) =>
        recommendation.title,
    ),
    [
      'Pandemic',
      'Codenames',
      'Just One',
    ],
  )
})

test('produces the same ordered recommendations for repeated identical input', () => {
  const answers = {
    players: 4,
    time: 'up-to-60',
    complexity: 'some-strategy',
    mood: ['cooperative'],
    style: ['working-together'],
    youngestPlayerAge: 12,
    contentPreference: 'family-friendly',
  }

  const firstResponse = recommendGames(
    mockGames,
    answers,
  )

  const secondResponse = recommendGames(
    mockGames,
    answers,
  )

  assert.deepEqual(
    firstResponse,
    secondResponse,
  )
})

test('returns frontend-safe recommendation objects without internal numeric scores', () => {
  const answers = {
    players: 4,
    time: 'up-to-60',
    complexity: 'some-strategy',
    mood: ['cooperative'],
    style: ['working-together'],
    youngestPlayerAge: 12,
    contentPreference: 'family-friendly',
  }

  const response = recommendGames(
    mockGames,
    answers,
  )

  const recommendation =
    response.recommendations[0]

  assert.equal(
    'internalScore' in recommendation,
    false,
  )

  assert.equal(
    'componentScores' in recommendation,
    false,
  )

  assert.ok(
    recommendation.matchReasons.length <= 2,
  )

  assert.ok(recommendation.matchLabel)
  assert.ok(recommendation.detailsUrl)
})

test('returns a limited-match result when only one fixture qualifies', () => {
  const answers = {
    players: 1,
    time: 'no-preference',
    complexity: 'no-preference',
    mood: ['strategic'],
    style: ['building-collecting'],
    youngestPlayerAge: 18,
    contentPreference: 'no-preference',
  }

  const response = recommendGames(
    mockGames,
    answers,
  )

  assert.equal(
    response.resultState,
    'limited-matches',
  )

  assert.equal(
    response.recommendationCount,
    1,
  )

  assert.equal(
    response.recommendations[0].title,
    'Wyrmspan',
  )
})

test('returns a no-match result when no fixture passes eligibility', () => {
  const answers = {
    players: 99,
    time: 'no-preference',
    complexity: 'no-preference',
    mood: ['no-preference'],
    style: ['no-preference'],
    youngestPlayerAge: 18,
    contentPreference: 'no-preference',
  }

  const response = recommendGames(
    mockGames,
    answers,
  )

  assert.deepEqual(response, {
    resultState: 'no-matches',
    recommendationCount: 0,
    recommendations: [],
  })
})

test('returns no more than five qualifying recommendations', () => {
  const pandemic = mockGames.find(
    (game) => game.title === 'Pandemic',
  )

  const games = Array.from(
    { length: 6 },
    (_, index) => ({
      ...pandemic,
      id: `test-game-${index + 1}`,
      title: `Test Game ${index + 1}`,
      source: {
        ...pandemic.source,
        externalId: String(900001 + index),
      },
    }),
  )

  const answers = {
    players: 4,
    time: 'up-to-60',
    complexity: 'some-strategy',
    mood: ['cooperative'],
    style: ['working-together'],
    youngestPlayerAge: 12,
    contentPreference: 'family-friendly',
  }

  const response = recommendGames(
    games,
    answers,
  )

  assert.equal(response.resultState, 'matches')
  assert.equal(response.recommendationCount, 5)
  assert.equal(response.recommendations.length, 5)

  assert.deepEqual(
    response.recommendations.map(
      (recommendation) => recommendation.rank,
    ),
    [1, 2, 3, 4, 5],
  )
})

// -----------------------------------------------------------------------------
// Documented recommendation scenarios
// -----------------------------------------------------------------------------

test('scenario 1 recommends suitable casual family games', () => {
  const response = recommendGames(mockGames, {
    players: 4,
    time: 'up-to-60',
    complexity: 'light',
    mood: ['social'],
    style: ['talking-guessing'],
    youngestPlayerAge: 10,
    contentPreference: 'family-friendly',
  })

  assert.deepEqual(
    response.recommendations.map(
      (recommendation) => recommendation.title,
    ),
    [
      'Codenames',
      'Just One',
    ],
  )

  assert.equal(
    response.resultState,
    'limited-matches',
  )
})

test('scenario 2 favours two-player strategic games', () => {
  const response = recommendGames(mockGames, {
    players: 2,
    time: 'up-to-120',
    complexity: 'moderate',
    mood: ['strategic'],
    style: ['planning-managing'],
    youngestPlayerAge: 18,
    contentPreference: 'no-preference',
  })

  assert.deepEqual(
    response.recommendations.map(
      (recommendation) => recommendation.title,
    ),
    [
      'Brass: Birmingham',
      'Wyrmspan',
      'Pandemic',
    ],
  )

  assert.equal(response.resultState, 'matches')
})

test('scenario 3 applies the quick cooperative-game constraints', () => {
  const response = recommendGames(mockGames, {
    players: 4,
    time: 'up-to-30',
    complexity: 'some-strategy',
    mood: ['cooperative'],
    style: ['working-together'],
    youngestPlayerAge: 12,
    contentPreference: 'family-friendly',
  })

  assert.deepEqual(
    response.recommendations.map(
      (recommendation) => recommendation.title,
    ),
    ['Codenames'],
  )

  assert.equal(
    response.resultState,
    'limited-matches',
  )

  assert.ok(
    response.recommendations[0].playTime.maxMinutes <= 33,
  )
})

test('scenario 4 favours a quick game for a large social group', () => {
  const response = recommendGames(mockGames, {
    players: 7,
    time: 'up-to-30',
    complexity: 'light',
    mood: ['chaotic'],
    style: ['talking-guessing'],
    youngestPlayerAge: 18,
    contentPreference: 'no-preference',
  })

  assert.deepEqual(
    response.recommendations.map(
      (recommendation) => recommendation.title,
    ),
    ['Codenames'],
  )

  assert.ok(
    response.recommendations[0].players.max >= 7,
  )
})

test('scenario 5 recommends only games that officially support solo play', () => {
  const response = recommendGames(mockGames, {
    players: 1,
    time: 'up-to-120',
    complexity: 'moderate',
    mood: ['immersive'],
    style: ['theme-story'],
    youngestPlayerAge: 18,
    contentPreference: 'no-preference',
  })

  assert.deepEqual(
    response.recommendations.map(
      (recommendation) => recommendation.title,
    ),
    [
      'Under Falling Skies',
      'Wyrmspan',
    ],
  )

  for (const recommendation of response.recommendations) {
    assert.ok(recommendation.players.min <= 1)
    assert.ok(recommendation.players.max >= 1)
  }
})

test('scenario 6 removes open preferences from scoring', () => {
  const response = recommendGames(mockGames, {
    players: 3,
    time: 'no-preference',
    complexity: 'no-preference',
    mood: ['no-preference'],
    style: ['no-preference'],
    youngestPlayerAge: 14,
    contentPreference: 'no-preference',
  })

  assert.deepEqual(
    response.recommendations.map(
      (recommendation) => recommendation.title,
    ),
    [
      'Brass: Birmingham',
      'Pandemic',
      'Wyrmspan',
    ],
  )

  assert.equal(response.resultState, 'matches')

  for (const recommendation of response.recommendations) {
    assert.ok(recommendation.players.min <= 3)
    assert.ok(recommendation.players.max >= 3)
  }
})

test('scenario 7 combines two mood and two style preferences without increasing their weights', () => {
  const response = recommendGames(mockGames, {
    players: 4,
    time: 'up-to-60',
    complexity: 'some-strategy',
    mood: [
      'social',
      'competitive',
    ],
    style: [
      'talking-guessing',
      'competing-directly',
    ],
    youngestPlayerAge: 14,
    contentPreference: 'no-preference',
  })

  assert.deepEqual(
    response.recommendations.map(
      (recommendation) => recommendation.title,
    ),
    [
      'Codenames',
      'Pandemic',
      'Just One',
    ],
  )

  assert.equal(response.resultState, 'matches')
})