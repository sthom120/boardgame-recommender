// -----------------------------------------------------------------------------
// Time configuration
// -----------------------------------------------------------------------------

const TIME_BUDGETS = {
  'up-to-20': 20,
  'up-to-30': 30,
  'up-to-60': 60,
  'up-to-120': 120,
}

// -----------------------------------------------------------------------------
// Recommendation factor weights
// -----------------------------------------------------------------------------
const FACTOR_WEIGHTS = {
  playerCount: 0.25,
  time: 0.2,
  complexity: 0.2,
  mood: 0.2,
  style: 0.15,
}

// -----------------------------------------------------------------------------
// Player-count suitability scoring
// -----------------------------------------------------------------------------

function scorePlayerCountSuitability(game, players) {
  const playerCountPoll = game?.playerCountPoll

  if (!Array.isArray(playerCountPoll) || playerCountPoll.length === 0) {
    return 0.5
  }

  const pollEntry = playerCountPoll.find((entry) => {
    const label = String(entry.players)

    if (label.endsWith('+')) {
      const minimumPlayers = Number(label.slice(0, -1))
      return Number.isFinite(minimumPlayers) && players >= minimumPlayers
    }

    return Number(label) === players
  })

  if (!pollEntry) {
    return 0.5
  }

  const bestVotes = pollEntry.bestVotes ?? 0
  const recommendedVotes = pollEntry.recommendedVotes ?? 0
  const notRecommendedVotes = pollEntry.notRecommendedVotes ?? 0

  const totalVotes =
    bestVotes + recommendedVotes + notRecommendedVotes

  if (totalVotes <= 0) {
    return 0.5
  }

  const rawScore =
    (bestVotes * 1 + recommendedVotes * 0.75) / totalVotes

  const confidence = Math.min(totalVotes / 50, 1)

  return confidence * rawScore + (1 - confidence) * 0.5
}


// -----------------------------------------------------------------------------
// Play-time scoring
// -----------------------------------------------------------------------------

function scorePlayTime(game, timePreference) {
  if (timePreference === 'no-preference') {
    return null
  }

  if (timePreference === 'over-120') {
    return 1
  }

  const timeBudget = TIME_BUDGETS[timePreference]
  const maxMinutes = game?.playTime?.maxMinutes

  if (
    typeof timeBudget !== 'number' ||
    typeof maxMinutes !== 'number'
  ) {
    return 0
  }

  if (maxMinutes <= timeBudget) {
    return 1
  }

  if (maxMinutes <= timeBudget * 1.1) {
    return 0.5
  }

  return 0
}


// -----------------------------------------------------------------------------
// Complexity scoring
// -----------------------------------------------------------------------------

function scoreComplexity(game, complexityPreference) {
  if (complexityPreference === 'no-preference') {
    return null
  }

  const complexity = game?.complexity?.average

  if (typeof complexity !== 'number') {
    return 0
  }

  if (complexityPreference === 'light') {
    if (complexity >= 1 && complexity <= 1.75) {
      return 1
    }

    if (complexity > 1.75 && complexity <= 2.25) {
      return 0.5
    }

    return 0
  }

  if (complexityPreference === 'some-strategy') {
    if (complexity >= 1.5 && complexity <= 2.5) {
      return 1
    }

    if (
      (complexity >= 1 && complexity < 1.5) ||
      (complexity > 2.5 && complexity <= 3)
    ) {
      return 0.5
    }

    return 0
  }

  if (complexityPreference === 'moderate') {
    if (complexity >= 2.5 && complexity <= 3.5) {
      return 1
    }

    if (
      (complexity >= 2 && complexity < 2.5) ||
      (complexity > 3.5 && complexity <= 4)
    ) {
      return 0.5
    }

    return 0
  }

  if (complexityPreference === 'deep') {
    if (complexity >= 3.5 && complexity <= 5) {
      return 1
    }

    if (complexity >= 3 && complexity < 3.5) {
      return 0.5
    }

    return 0
  }

  return 0
}


// -----------------------------------------------------------------------------
// Mood scoring configuration
// -----------------------------------------------------------------------------

const HIGH_CONFLICT_MECHANICS = [
  'Take That',
  'Player Elimination',
  'Area Majority / Influence',
  'Area Control',
  'Auction / Bidding',
  'Betting and Bluffing',
]

const MOOD_SIGNALS = {
  social: {
    primaryMechanics: [
      'Communication Limits',
      'Team-Based Game',
      'Acting',
      'Singing',
      'Role Playing',
      'Storytelling',
      'Player Judge',
      'Voting',
    ],
    secondaryMechanics: [
      'Deduction',
      'Memory',
    ],
    secondaryCategories: [
      'Party Game',
      'Word Game',
    ],
  },

  competitive: {
    primaryMechanics: [
      'Take That',
      'Player Elimination',
      'Area Majority / Influence',
      'Area Control',
      'Auction / Bidding',
      'Betting and Bluffing',
      'Race',
      'Trick-taking',
    ],
    secondaryMechanics: [
      'Network and Route Building',
      'Set Collection',
      'Majority Influence',
      'Market',
    ],
  },

  cooperative: {
    primaryMechanics: [
      'Cooperative Game',
      'Team-Based Game',
    ],
  },

  strategic: {
    primaryMechanics: [
      'Worker Placement',
      'Action Drafting',
      'Action Points',
      'Network and Route Building',
      'Tech Trees / Tech Tracks',
      'Market',
      'Loans',
      'Income',
      'Resource to Move',
      'Area Majority / Influence',
    ],
    secondaryMechanics: [
      'Hand Management',
      'Set Collection',
      'Open Drafting',
      'End Game Bonuses',
      'Variable Player Powers',
    ],
  },

  immersive: {
    primaryMechanics: [
      'Narrative Choice / Paragraph',
      'Storytelling',
      'Scenario / Mission / Campaign Game',
      'Role Playing',
      'Campaign / Battle Card Driven',
    ],
    secondaryCategories: [
      'Adventure',
      'Fantasy',
      'Horror',
      'Science Fiction',
      'Exploration',
      'Mythology',
      'Movies / TV / Radio theme',
    ],
  },

  chaotic: {
    primaryMechanics: [
      'Take That',
      'Push Your Luck',
      'Player Judge',
      'Acting',
      'Singing',
      'Betting and Bluffing',
    ],
    secondaryMechanics: [
      'Dice Rolling',
      'Simultaneous Action Selection',
      'Real-Time',
    ],
    secondaryCategories: [
      'Party Game',
    ],
  },
}

// -----------------------------------------------------------------------------
// Game-style scoring configuration
// -----------------------------------------------------------------------------

const STYLE_SIGNALS = {
  'working-things-out': {
    primaryMechanics: [
      'Deduction',
      'Pattern Recognition',
      'Pattern Building',
      'Logic',
      'Memory',
    ],
    secondaryMechanics: [
      'Hidden Roles',
      'Secret Unit Deployment',
      'Questions and Answers',
    ],
  },

  'building-collecting': {
    primaryMechanics: [
      'Set Collection',
      'Deck, Bag, and Pool Building',
      'Deck Construction',
      'Pattern Building',
      'Tile Placement',
    ],
    secondaryMechanics: [
      'Open Drafting',
      'Closed Drafting',
      'Card Drafting',
      'Hand Management',
      'End Game Bonuses',
    ],
  },

  'planning-managing': {
    primaryMechanics: [
      'Worker Placement',
      'Action Points',
      'Action Drafting',
      'Network and Route Building',
      'Market',
      'Loans',
      'Income',
      'Tech Trees / Tech Tracks',
      'Resource to Move',
    ],
    secondaryMechanics: [
      'Hand Management',
      'Open Drafting',
      'Variable Player Powers',
      'End Game Bonuses',
      'Area Majority / Influence',
    ],
  },

  'talking-guessing': {
    primaryMechanics: [
      'Communication Limits',
      'Deduction',
      'Acting',
      'Storytelling',
      'Questions and Answers',
    ],
    secondaryMechanics: [
      'Team-Based Game',
      'Voting',
      'Hidden Roles',
    ],
    secondaryCategories: [
      'Word Game',
      'Party Game',
    ],
  },

  'working-together': {
    primaryMechanics: [
      'Cooperative Game',
      'Team-Based Game',
    ],
  },

  'competing-directly': {
    primaryMechanics: [
      'Take That',
      'Player Elimination',
      'Area Majority / Influence',
      'Area Control',
      'Auction / Bidding',
      'Betting and Bluffing',
      'Race',
    ],
    secondaryMechanics: [
      'Network and Route Building',
      'Trick-taking',
      'Market',
    ],
  },

  'theme-story': {
    primaryMechanics: [
      'Narrative Choice / Paragraph',
      'Storytelling',
      'Scenario / Mission / Campaign Game',
      'Role Playing',
    ],
    secondaryCategories: [
      'Adventure',
      'Fantasy',
      'Horror',
      'Science Fiction',
      'Exploration',
      'Mythology',
    ],
  },
}

// -----------------------------------------------------------------------------
// Shared scoring helpers
// -----------------------------------------------------------------------------

function hasAnySignal(values, signals = []) {
  return signals.some((signal) => values.includes(signal))
}


// -----------------------------------------------------------------------------
// Individual mood scoring
// -----------------------------------------------------------------------------

function scoreSingleMood(game, mood) {
  const mechanics = Array.isArray(game?.mechanics)
    ? game.mechanics
    : []

  const categories = Array.isArray(game?.categories)
    ? game.categories
    : []

  if (mood === 'relaxed') {
    const complexity = game?.complexity?.average
    const maxMinutes = game?.playTime?.maxMinutes

    const hasHighConflictMechanic =
      hasAnySignal(mechanics, HIGH_CONFLICT_MECHANICS)

    if (
      typeof complexity === 'number' &&
      typeof maxMinutes === 'number' &&
      complexity <= 2 &&
      maxMinutes <= 60 &&
      !hasHighConflictMechanic
    ) {
      return 1
    }

    if (
      typeof complexity === 'number' &&
      complexity <= 2.5 &&
      !hasHighConflictMechanic
    ) {
      return 0.5
    }

    return 0
  }

  const signals = MOOD_SIGNALS[mood]

  if (!signals) {
    return 0
  }

  const hasPrimarySignal =
    hasAnySignal(mechanics, signals.primaryMechanics)

  if (hasPrimarySignal) {
    return 1
  }

  const hasSecondarySignal =
    hasAnySignal(mechanics, signals.secondaryMechanics) ||
    hasAnySignal(categories, signals.secondaryCategories)

  if (hasSecondarySignal) {
    return 0.5
  }

  if (
    mood === 'strategic' &&
    typeof game?.complexity?.average === 'number' &&
    game.complexity.average >= 2.5
  ) {
    return 0.5
  }

  return 0
}


// -----------------------------------------------------------------------------
// Combined mood scoring
// -----------------------------------------------------------------------------

function scoreMood(game, moodPreferences) {
  if (
    !Array.isArray(moodPreferences) ||
    moodPreferences.length === 0 ||
    moodPreferences.includes('no-preference')
  ) {
    return null
  }

  const scores = moodPreferences.map((mood) =>
    scoreSingleMood(game, mood),
  )

  const total = scores.reduce((sum, score) => sum + score, 0)

  return total / scores.length
}

// -----------------------------------------------------------------------------
// Individual game-style scoring
// -----------------------------------------------------------------------------

function scoreSingleStyle(game, style) {
  const mechanics = Array.isArray(game?.mechanics)
    ? game.mechanics
    : []

  const categories = Array.isArray(game?.categories)
    ? game.categories
    : []

  if (style === 'quick-simple') {
    const complexity = game?.complexity?.average
    const maxMinutes = game?.playTime?.maxMinutes

    if (
      typeof complexity !== 'number' ||
      typeof maxMinutes !== 'number'
    ) {
      return 0
    }

    if (complexity <= 1.75 && maxMinutes <= 30) {
      return 1
    }

    if (complexity <= 2.25 && maxMinutes <= 45) {
      return 0.5
    }

    return 0
  }

  const signals = STYLE_SIGNALS[style]

  if (!signals) {
    return 0
  }

  const hasPrimarySignal =
    hasAnySignal(mechanics, signals.primaryMechanics)

  if (hasPrimarySignal) {
    return 1
  }

  const hasSecondarySignal =
    hasAnySignal(mechanics, signals.secondaryMechanics) ||
    hasAnySignal(categories, signals.secondaryCategories)

  if (hasSecondarySignal) {
    return 0.5
  }

  return 0
}


// -----------------------------------------------------------------------------
// Combined game-style scoring
// -----------------------------------------------------------------------------

function scoreStyle(game, stylePreferences) {
  if (
    !Array.isArray(stylePreferences) ||
    stylePreferences.length === 0 ||
    stylePreferences.includes('no-preference')
  ) {
    return null
  }

  const scores = stylePreferences.map((style) =>
    scoreSingleStyle(game, style),
  )

  const total = scores.reduce((sum, score) => sum + score, 0)

  return total / scores.length
}

// -----------------------------------------------------------------------------
// Overall weighted score
// -----------------------------------------------------------------------------

function calculateWeightedScore(componentScores) {
  let weightedTotal = 0
  let activeWeightTotal = 0

  for (const [factor, weight] of Object.entries(FACTOR_WEIGHTS)) {
    const score = componentScores[factor]

    if (score === null) {
      continue
    }

    weightedTotal += score * weight
    activeWeightTotal += weight
  }

  if (activeWeightTotal === 0) {
    return 0
  }

  return weightedTotal / activeWeightTotal
}

// -----------------------------------------------------------------------------
// Hard eligibility checks
// -----------------------------------------------------------------------------

function checkEligibility(game, answers) {
  // Expansion eligibility
  if (game?.relationships?.baseGameIds?.length > 0) {
    return {
      eligible: false,
      reason: 'expansion',
    }
  }

  // Player-count eligibility
  const minPlayers = game?.playerRange?.min
  const maxPlayers = game?.playerRange?.max

  if (typeof minPlayers !== 'number' || typeof maxPlayers !== 'number') {
    return {
      eligible: false,
      reason: 'player-range-unavailable',
    }
  }

  if (answers.players < minPlayers || answers.players > maxPlayers) {
    return {
      eligible: false,
      reason: 'player-count-out-of-range',
    }
  }

  // Age eligibility
  const publisherMinimumAge = game?.age?.publisherMinimum

  if (typeof publisherMinimumAge !== 'number') {
    return {
      eligible: false,
      reason: 'age-unavailable',
    }
  }

  if (answers.youngestPlayerAge < publisherMinimumAge) {
    return {
      eligible: false,
      reason: 'player-too-young',
    }
  }

  // Content eligibility
  if (answers.contentPreference === 'family-friendly') {
    const contentClassification = game?.content?.classification

    if (contentClassification !== 'family-friendly') {
      return {
        eligible: false,
        reason: 'content-not-family-friendly',
      }
    }
  }

  // Play-time eligibility
  const timeBudget = TIME_BUDGETS[answers.time]

  if (typeof timeBudget === 'number') {
    const maxMinutes = game?.playTime?.maxMinutes

    if (typeof maxMinutes !== 'number') {
      return {
        eligible: false,
        reason: 'play-time-unavailable',
      }
    }

    const maximumAllowedTime = timeBudget * 1.1

    if (maxMinutes > maximumAllowedTime) {
      return {
        eligible: false,
        reason: 'play-time-too-long',
      }
    }
  }

  return {
    eligible: true,
    reason: null,
  }
}


// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  checkEligibility,
  scorePlayerCountSuitability,
  scorePlayTime,
  scoreComplexity,
  scoreMood,
  scoreStyle,
  calculateWeightedScore,
}