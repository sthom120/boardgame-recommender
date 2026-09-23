// -----------------------------------------------------------------------------
// BoardGameGeek API configuration
// -----------------------------------------------------------------------------

const BGG_API_BASE_URL =
  'https://boardgamegeek.com/xmlapi2'

const MAX_IDS_PER_REQUEST = 20

const MAX_ATTEMPTS = 3

const TEMPORARY_FAILURE_STATUSES = [
  500,
  503,
]

// -----------------------------------------------------------------------------
// Retry helpers
// -----------------------------------------------------------------------------

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function isTemporaryFailure(status) {
  return TEMPORARY_FAILURE_STATUSES.includes(
    status,
  )
}

function getRetryDelay(attemptNumber) {
  return 5000 * attemptNumber
}

// -----------------------------------------------------------------------------
// BGG thing request
// -----------------------------------------------------------------------------

async function fetchBggThingsXml(
  ids,
  {
    token = process.env.BGG_API_TOKEN,
    fetchImpl = fetch,
    sleepImpl = sleep,
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

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt += 1
  ) {
    const response = await fetchImpl(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      return response.text()
    }

    const shouldRetry =
      isTemporaryFailure(response.status) &&
      attempt < MAX_ATTEMPTS

    if (!shouldRetry) {
      throw new Error(
        `BGG API request failed with status ${response.status}`,
      )
    }

    const delay =
      getRetryDelay(attempt)

    await sleepImpl(delay)
  }

  throw new Error(
    'BGG API request failed unexpectedly',
  )
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  fetchBggThingsXml,
}