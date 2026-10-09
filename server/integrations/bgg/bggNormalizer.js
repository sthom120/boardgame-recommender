const {
  XMLParser,
} = require('fast-xml-parser')

// -----------------------------------------------------------------------------
// XML parser configuration
// -----------------------------------------------------------------------------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  trimValues: true,
})

// -----------------------------------------------------------------------------
// Normalisation helpers
// -----------------------------------------------------------------------------

function asArray(value) {
  if (value === undefined || value === null) {
    return []
  }

  return Array.isArray(value)
    ? value
    : [value]
}

function toPositiveInteger(value) {
  const number = Number(value)

  if (
    !Number.isInteger(number) ||
    number <= 0
  ) {
    return null
  }

  return number
}

function toNonNegativeInteger(value) {
  const number = Number(value)

  if (
    !Number.isInteger(number) ||
    number < 0
  ) {
    return null
  }

  return number
}

function toPositiveNumber(value) {
  const number = Number(value)

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return null
  }

  return number
}

function getPrimaryName(item) {
  const names = asArray(item?.name)

  const primaryName = names.find(
    (name) => name?.type === 'primary',
  )

  return primaryName?.value ?? null
}

function cleanText(value) {
  if (typeof value !== 'string') {
    return null
  }

  const cleaned = value.trim()

  return cleaned || null
}

function getLinkValues(item, type) {
  return asArray(item?.link)
    .filter(
      (link) =>
        link?.type === type,
    )
    .map(
      (link) =>
        cleanText(link?.value),
    )
    .filter(Boolean)
}

function getBaseGameIds(item) {
  return asArray(item?.link)
    .filter(
      (link) =>
        link?.type === 'boardgameexpansion' &&
        String(link?.inbound).toLowerCase() ===
          'true',
    )
    .map((link) => {
      const externalId =
        cleanText(String(link?.id ?? ''))

      if (!externalId) {
        return null
      }

      return `game-${externalId}`
    })
    .filter(Boolean)
}

function getPoll(item, pollName) {
  return asArray(item?.poll).find(
    (poll) =>
      poll?.name === pollName,
  )
}

function getPollVote(results, value) {
  const result = asArray(
    results?.result,
  ).find(
    (entry) =>
      entry?.value === value,
  )

  return toNonNegativeInteger(
    result?.numvotes,
  )
}

// -----------------------------------------------------------------------------
// Player-count poll normalisation
// -----------------------------------------------------------------------------

function normalizePlayerCountPoll(item) {
  const poll = getPoll(
    item,
    'suggested_numplayers',
  )

  if (!poll) {
    return []
  }

  return asArray(poll.results)
    .map((results) => {
      const players =
        results?.numplayers

      if (
        players === undefined ||
        players === null ||
        String(players).trim() === ''
      ) {
        return null
      }

      return {
        players: String(players),

        bestVotes:
          getPollVote(
            results,
            'Best',
          ),

        recommendedVotes:
          getPollVote(
            results,
            'Recommended',
          ),

        notRecommendedVotes:
          getPollVote(
            results,
            'Not Recommended',
          ),
      }
    })
    .filter(Boolean)
}

// -----------------------------------------------------------------------------
// Community age poll normalisation
// -----------------------------------------------------------------------------

function normalizeCommunityAgePoll(item) {
  const poll = getPoll(
    item,
    'suggested_playerage',
  )

  if (!poll) {
    return []
  }

  const results = asArray(
    poll?.results?.result,
  )

  return results
    .map((result) => {
      const age = result?.value
      const votes =
        toNonNegativeInteger(
          result?.numvotes,
        )

      if (
        age === undefined ||
        age === null ||
        String(age).trim() === '' ||
        votes === null
      ) {
        return null
      }

      return {
        age: String(age),
        votes,
      }
    })
    .filter(Boolean)
}

// -----------------------------------------------------------------------------
// Individual BGG item normalisation
// -----------------------------------------------------------------------------

function normalizeBggItem(item) {
  const externalId = String(item?.id ?? '')

  const ratings =
    item?.statistics?.ratings

  return {
    id: `game-${externalId}`,

    source: {
      provider: 'boardgamegeek',
      externalId,
    },

    title: getPrimaryName(item),

    description: cleanText(
      item?.description,
    ),

    yearPublished: toPositiveInteger(
      item?.yearpublished?.value,
    ),

    images: {
      thumbnailUrl: cleanText(
        item?.thumbnail,
      ),
      imageUrl: cleanText(
        item?.image,
      ),
    },

    playerRange: {
      min: toPositiveInteger(
        item?.minplayers?.value,
      ),
      max: toPositiveInteger(
        item?.maxplayers?.value,
      ),
    },

    playTime: {
      minMinutes: toPositiveInteger(
        item?.minplaytime?.value,
      ),
      maxMinutes: toPositiveInteger(
        item?.maxplaytime?.value,
      ),
    },

    age: {
      publisherMinimum:
        toPositiveInteger(
          item?.minage?.value,
        ),

      communityPoll:
        normalizeCommunityAgePoll(
          item,
        ),
    },

    complexity: {
      average: toPositiveNumber(
        ratings?.averageweight?.value,
      ),
    },

    playerCountPoll:
      normalizePlayerCountPoll(
        item,
      ),

    mechanics: getLinkValues(
      item,
      'boardgamemechanic',
    ),

    categories: getLinkValues(
      item,
      'boardgamecategory',
    ),

    ratings: {
      bayesianAverage:
        toPositiveNumber(
          ratings?.bayesaverage?.value,
        ),

      usersRated:
        toPositiveInteger(
          ratings?.usersrated?.value,
        ),
    },

relationships: {
  baseGameIds: getBaseGameIds(item),
},

    content: {
      classification: 'unknown',
    },
  }
}

// -----------------------------------------------------------------------------
// BGG XML normalisation
// -----------------------------------------------------------------------------

function normalizeBggThingsXml(xml) {
  const parsed = parser.parse(xml)

  const items = asArray(
    parsed?.items?.item,
  )

  return items.map(normalizeBggItem)
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  normalizeBggThingsXml,
}