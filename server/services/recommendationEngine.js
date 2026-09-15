const TIME_BUDGETS = {
  'up-to-20': 20,
  'up-to-30': 30,
  'up-to-60': 60,
  'up-to-120': 120,
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
}