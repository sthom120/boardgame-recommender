const TIME_BUDGETS = {
  'up-to-20': 20,
  'up-to-30': 30,
  'up-to-60': 60,
  'up-to-120': 120,
}

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

function checkEligibility(game, answers) {
  if (game?.relationships?.baseGameIds?.length > 0) {
    return {
      eligible: false,
      reason: 'expansion',
    }
  }

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

  if (answers.contentPreference === 'family-friendly') {
    const contentClassification = game?.content?.classification

    if (contentClassification !== 'family-friendly') {
      return {
        eligible: false,
        reason: 'content-not-family-friendly',
      }
    }
  }

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

module.exports = {
  checkEligibility,
  scorePlayerCountSuitability,
  scorePlayTime,
}