const test = require('node:test')
const assert = require('node:assert/strict')

const {
  checkEligibility,
  scorePlayerCountSuitability,
  scorePlayTime,
  scoreComplexity,
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