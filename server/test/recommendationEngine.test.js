const test = require('node:test')
const assert = require('node:assert/strict')

const {
  checkEligibility,
  scorePlayerCountSuitability,
  scorePlayTime,
  scoreComplexity,
  scoreMood,
  scoreStyle,
  calculateWeightedScore,
  getMatchLabel,
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