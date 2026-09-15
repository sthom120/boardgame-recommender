const test = require('node:test')
const assert = require('node:assert/strict')

const {
  checkEligibility,
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