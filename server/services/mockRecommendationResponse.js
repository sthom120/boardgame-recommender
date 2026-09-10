function getComplexityLabel(value) {
  if (typeof value !== 'number') {
    return 'Unknown'
  }

  if (value >= 1 && value < 1.75) {
    return 'Light and easy'
  }

  if (value >= 1.75 && value < 2.25) {
    return 'Some strategy'
  }

  if (value >= 2.25 && value < 3.5) {
    return 'Moderately challenging'
  }

  if (value >= 3.5 && value <= 5) {
    return 'Deep and challenging'
  }

  return 'Unknown'
}

function toMockRecommendation(game, index) {
  return {
    rank: index + 1,
    gameId: game.id,
    title: game.title,
    summary: game.description,
    imageUrl: game.images.imageUrl,
    matchLabel: 'Good match',
    players: {
      min: game.playerRange.min,
      max: game.playerRange.max,
    },
    playTime: {
      minMinutes: game.playTime.minMinutes,
      maxMinutes: game.playTime.maxMinutes,
    },
    complexity: {
      label: getComplexityLabel(game.complexity.average),
    },
    age: {
      publisherMinimum: game.age.publisherMinimum,
    },
    matchReasons: [
      'Mock recommendation generated for frontend development.',
    ],
    caveats: [],
    detailsUrl: `https://boardgamegeek.com/boardgame/${game.source.externalId}`,
  }
}

function buildMockRecommendationResponse(games) {
  const recommendations = games
    .slice(0, 5)
    .map((game, index) => toMockRecommendation(game, index))

  let resultState = 'no-matches'

  if (recommendations.length >= 3) {
    resultState = 'matches'
  } else if (recommendations.length > 0) {
    resultState = 'limited-matches'
  }

  return {
    resultState,
    recommendationCount: recommendations.length,
    recommendations,
  }
}

module.exports = {
  buildMockRecommendationResponse,
}
