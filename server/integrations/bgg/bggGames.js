const {
  fetchBggThingsXml,
} = require('./bggClient')

const {
  normalizeBggThingsXml,
} = require('./bggNormalizer')

// -----------------------------------------------------------------------------
// Shared BGG response cache
// -----------------------------------------------------------------------------

const sharedBggCache = new Map()

// -----------------------------------------------------------------------------
// Normalized BGG game boundary
// -----------------------------------------------------------------------------

async function fetchBggGames(
  ids,
  {
    cache = sharedBggCache,
    ...clientOptions
  } = {},
) {
  const xml = await fetchBggThingsXml(
    ids,
    {
      ...clientOptions,
      cache,
    },
  )

  return normalizeBggThingsXml(xml)
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  fetchBggGames,
}