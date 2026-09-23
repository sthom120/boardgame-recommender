// -----------------------------------------------------------------------------
// BoardGameGeek API configuration
// -----------------------------------------------------------------------------

const BGG_API_BASE_URL =
  'https://boardgamegeek.com/xmlapi2'

const MAX_IDS_PER_REQUEST = 20

// -----------------------------------------------------------------------------
// BGG thing request
// -----------------------------------------------------------------------------

async function fetchBggThingsXml(
  ids,
  {
    token = process.env.BGG_API_TOKEN,
    fetchImpl = fetch,
  } = {},
) {
  if (!token) {
    throw new Error('BGG API token is required')
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error(
      'At least one BGG id is required',
    )
  }

  if (ids.length > MAX_IDS_PER_REQUEST) {
    throw new Error(
      `BGG thing requests support a maximum of ${MAX_IDS_PER_REQUEST} ids`,
    )
  }

  const idList = ids.join(',')

  const url =
    `${BGG_API_BASE_URL}/thing` +
    `?id=${idList}&stats=1`

  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(
      `BGG API request failed with status ${response.status}`,
    )
  }

  return response.text()
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  fetchBggThingsXml,
}