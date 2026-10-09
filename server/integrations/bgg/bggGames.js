const {
  fetchBggThingsXml,
} = require('./bggClient')

const {
  normalizeBggThingsXml,
} = require('./bggNormalizer')

// -----------------------------------------------------------------------------
// Shared BGG integration state
// -----------------------------------------------------------------------------

const sharedBggCache = new Map()

const sharedBggRequestState = {
  lastRequestAt: null,
}

// -----------------------------------------------------------------------------
// Normalized BGG game boundary
// -----------------------------------------------------------------------------

async function fetchBggGames(
  ids,
  {
    cache = sharedBggCache,
    requestState =
      sharedBggRequestState,
    ...clientOptions
  } = {},
) {
  const xml = await fetchBggThingsXml(
    ids,
    {
      ...clientOptions,
      cache,
      requestState,
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