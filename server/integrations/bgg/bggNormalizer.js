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

// -----------------------------------------------------------------------------
// Individual BGG item normalisation
// -----------------------------------------------------------------------------

function normalizeBggItem(item) {
  const externalId = String(item?.id ?? '')

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
      thumbnailUrl: null,
      imageUrl: null,
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
      publisherMinimum: toPositiveInteger(
        item?.minage?.value,
      ),
      communityPoll: [],
    },

    complexity: {
      average: null,
    },

    playerCountPoll: [],

    mechanics: [],

    categories: [],

    ratings: {
      bayesianAverage: null,
      usersRated: null,
    },

    relationships: {
      baseGameIds: [],
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