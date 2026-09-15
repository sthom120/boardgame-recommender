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

const COMPLEXITY_STRONG_RANGES = {
  light: {
    min: 1,
    max: 1.75,
  },
  'some-strategy': {
    min: 1.5,
    max: 2.5,
  },
  moderate: {
    min: 2.5,
    max: 3.5,
  },
  deep: {
    min: 3.5,
    max: 5,
  },
}


const MOOD_LABELS = {
  relaxed: 'relaxed',
  social: 'social and lively',
  competitive: 'competitive',
  cooperative: 'cooperative',
  strategic: 'strategic',
  immersive: 'immersive',
  chaotic: 'chaotic and funny',
}

const STYLE_LABELS = {
  'working-things-out': 'working things out',
  'building-collecting': 'building and collecting',
  'planning-managing': 'planning and managing',
  'talking-guessing': 'talking and guessing',
  'working-together': 'working together',
  'competing-directly': 'competing directly',
  'theme-story': 'exploring a theme or story',
  'quick-simple': 'something quick and simple',
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
// Match labels and display threshold
// -----------------------------------------------------------------------------

function getMatchLabel(score) {
  if (score >= 0.85) {
    return 'Excellent match'
  }

  if (score >= 0.7) {
    return 'Strong match'
  }

  if (score >= 0.55) {
    return 'Good match'
  }

  return null
}


// -----------------------------------------------------------------------------
// Deterministic recommendation ordering
// -----------------------------------------------------------------------------

function roundScoreForTie(score) {
  if (!Number.isFinite(score)) {
    return 0
  }

  return Math.round((score + Number.EPSILON) * 10000) / 10000
}

function compareAscendingStrings(first, second) {
  const firstValue = String(first ?? '')
  const secondValue = String(second ?? '')

  if (firstValue < secondValue) {
    return -1
  }

  if (firstValue > secondValue) {
    return 1
  }

  return 0
}

function compareRecommendations(first, second) {
  const firstScore = roundScoreForTie(first?.internalScore)
  const secondScore = roundScoreForTie(second?.internalScore)

  // Higher overall recommendation score wins first.
  if (firstScore !== secondScore) {
    return secondScore - firstScore
  }

  // Component tie-break order follows the documented factor priority.
  const componentOrder = [
    'playerCount',
    'time',
    'complexity',
    'mood',
    'style',
  ]

  for (const factor of componentOrder) {
    const firstComponent = first?.componentScores?.[factor]
    const secondComponent = second?.componentScores?.[factor]

    // Inactive or unavailable factors are skipped.
    if (
      !Number.isFinite(firstComponent) ||
      !Number.isFinite(secondComponent)
    ) {
      continue
    }

    if (firstComponent !== secondComponent) {
      return secondComponent - firstComponent
    }
  }

  // Ratings are used only after questionnaire-based factors.
  const ratingOrder = [
    'bayesianAverage',
    'usersRated',
  ]

  for (const rating of ratingOrder) {
    const firstRating = first?.ratings?.[rating]
    const secondRating = second?.ratings?.[rating]

    if (
      !Number.isFinite(firstRating) ||
      !Number.isFinite(secondRating)
    ) {
      continue
    }

    if (firstRating !== secondRating) {
      return secondRating - firstRating
    }
  }

  // Stable alphabetical fallback.
  const titleComparison = compareAscendingStrings(
    first?.title,
    second?.title,
  )

  if (titleComparison !== 0) {
    return titleComparison
  }

  // Final stable fallback.
  return compareAscendingStrings(first?.id, second?.id)
}

// -----------------------------------------------------------------------------
// Recommendation caveats
// -----------------------------------------------------------------------------

function getCommunitySuggestedAge(game) {
  const communityPoll = game?.age?.communityPoll

  if (!Array.isArray(communityPoll) || communityPoll.length === 0) {
    return null
  }

  const usableEntries = communityPoll
    .map((entry) => ({
      age: Number(entry.age),
      votes: Number(entry.votes),
    }))
    .filter(
      (entry) =>
        Number.isFinite(entry.age) &&
        Number.isFinite(entry.votes),
    )

  if (usableEntries.length === 0) {
    return null
  }

  usableEntries.sort((first, second) => {
    if (first.votes !== second.votes) {
      return second.votes - first.votes
    }

    return first.age - second.age
  })

  return usableEntries[0].age
}

function generateCaveats(
  game,
  answers,
  componentScores,
  internalScore,
) {
  if (
    !Number.isFinite(internalScore) ||
    internalScore < 0.55
  ) {
    return []
  }

  const caveats = []

  // Player-count caveat
  const playerScore = componentScores?.playerCount

  if (
    Number.isFinite(playerScore) &&
    playerScore < 0.5
  ) {
    caveats.push(
      `Works with ${answers.players} players, but community feedback is less positive at this player count.`,
    )
  }

  // Play-time caveat
  const timeBudget = TIME_BUDGETS[answers.time]
  const maxMinutes = game?.playTime?.maxMinutes

  if (
    typeof timeBudget === 'number' &&
    typeof maxMinutes === 'number' &&
    maxMinutes > timeBudget &&
    maxMinutes <= timeBudget * 1.1
  ) {
    caveats.push(
      `This may run a little longer than your preferred ${timeBudget} minutes.`,
    )
  }

  // Complexity caveat
  const complexityScore = componentScores?.complexity
  const complexity = game?.complexity?.average
  const strongRange =
    COMPLEXITY_STRONG_RANGES[answers.complexity]

  if (
    complexityScore === 0.5 &&
    typeof complexity === 'number' &&
    strongRange
  ) {
    if (complexity > strongRange.max) {
      caveats.push(
        'This is slightly more complex than the level you selected.',
      )
    } else if (complexity < strongRange.min) {
      caveats.push(
        'This is slightly lighter than the level you selected.',
      )
    }
  }

  // Age caveat
  const publisherMinimumAge =
    game?.age?.publisherMinimum

  const communitySuggestedAge =
    getCommunitySuggestedAge(game)

  if (
    typeof publisherMinimumAge === 'number' &&
    typeof communitySuggestedAge === 'number' &&
    Math.abs(
      publisherMinimumAge - communitySuggestedAge,
    ) >= 2
  ) {
    caveats.push(
      `The publisher recommends ages ${publisherMinimumAge}+, while community feedback most strongly suggests ages ${communitySuggestedAge}+.`,
    )
  }

  return caveats
}

// -----------------------------------------------------------------------------
// Recommendation explanations
// -----------------------------------------------------------------------------

const EXPLANATION_FACTOR_ORDER = [
  'playerCount',
  'time',
  'complexity',
  'mood',
  'style',
]

function getSupportedMoodLabels(game, moodPreferences) {
  if (!Array.isArray(moodPreferences)) {
    return []
  }

  return moodPreferences
    .filter((mood) => mood !== 'no-preference')
    .filter((mood) => scoreSingleMood(game, mood) >= 0.5)
    .map((mood) => MOOD_LABELS[mood])
    .filter(Boolean)
}

function getSupportedStyleLabels(game, stylePreferences) {
  if (!Array.isArray(stylePreferences)) {
    return []
  }

  return stylePreferences
    .filter((style) => style !== 'no-preference')
    .filter((style) => scoreSingleStyle(game, style) >= 0.5)
    .map((style) => STYLE_LABELS[style])
    .filter(Boolean)
}

function joinPreferenceLabels(labels) {
  if (labels.length === 1) {
    return labels[0]
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`
  }

  return labels.join(', ')
}

function buildExplanationReason(
  factor,
  game,
  answers,
  componentScores,
) {
  const score = componentScores[factor]

  if (factor === 'playerCount') {
    if (score >= 0.75) {
      return `A strong fit for ${answers.players} players.`
    }

    return `Supports your group of ${answers.players} players.`
  }

  if (factor === 'time') {
    if (answers.time === 'over-120') {
      return 'Fits your preference for longer games.'
    }

    const timeBudget = TIME_BUDGETS[answers.time]

    if (typeof timeBudget !== 'number') {
      return null
    }

    if (score === 1) {
      return `Fits comfortably within your ${timeBudget}-minute limit.`
    }

    return `Stays close to your ${timeBudget}-minute limit.`
  }

  if (factor === 'complexity') {
    if (score === 1) {
      return 'Matches the complexity level you selected.'
    }

    return 'Is close to the complexity level you selected.'
  }

  if (factor === 'mood') {
    const labels = getSupportedMoodLabels(
      game,
      answers.mood,
    )

    if (labels.length === 0) {
      return null
    }

    const labelText = joinPreferenceLabels(labels)

    return `Matches your ${labelText} mood preference${labels.length > 1 ? 's' : ''}.`
  }

  if (factor === 'style') {
    const labels = getSupportedStyleLabels(
      game,
      answers.style,
    )

    if (labels.length === 0) {
      return null
    }

    const labelText = joinPreferenceLabels(labels)

    return `Matches the ${labelText} style you selected.`
  }

  return null
}

function generateMatchReasons(
  game,
  answers,
  componentScores,
) {
  const rankedFactors = EXPLANATION_FACTOR_ORDER
    .map((factor, priority) => ({
      factor,
      priority,
      score: componentScores?.[factor],
      contribution:
        componentScores?.[factor] *
        FACTOR_WEIGHTS[factor],
    }))
    .filter(
      ({ score }) =>
        Number.isFinite(score) &&
        score >= 0.5,
    )
    .sort((first, second) => {
      if (first.contribution !== second.contribution) {
        return second.contribution - first.contribution
      }

      return first.priority - second.priority
    })

  const reasons = []

  for (const { factor } of rankedFactors) {
    const reason = buildExplanationReason(
      factor,
      game,
      answers,
      componentScores,
    )

    if (reason) {
      reasons.push(reason)
    }

    if (reasons.length === 2) {
      break
    }
  }

  return reasons
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
  getMatchLabel,
  compareRecommendations,
  generateCaveats,
  generateMatchReasons,
}