// -----------------------------------------------------------------------------
// BoardGameGeek API configuration
// -----------------------------------------------------------------------------

const BGG_API_BASE_URL =
  'https://boardgamegeek.com/xmlapi2'

const MAX_IDS_PER_REQUEST = 20

const MAX_ATTEMPTS = 3

const DEFAULT_CACHE_TTL_MS =
  24 * 60 * 60 * 1000

const DEFAULT_MINIMUM_REQUEST_INTERVAL_MS =
  5000

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
// Request pacing helpers
// -----------------------------------------------------------------------------

async function waitForRequestWindow(
  requestState,
  minimumRequestIntervalMs,
  nowImpl,
  sleepImpl,
) {
  if (
    !requestState ||
    requestState.lastRequestAt === null
  ) {
    return
  }

  const elapsed =
    nowImpl() -
    requestState.lastRequestAt

  const remaining =
    minimumRequestIntervalMs -
    elapsed

  if (remaining > 0) {
    await sleepImpl(remaining)
  }
}

function recordRequestTime(
  requestState,
  nowImpl,
) {
  if (!requestState) {
    return
  }

  requestState.lastRequestAt =
    nowImpl()
}

async function runPacedRequest(
  requestState,
  minimumRequestIntervalMs,
  nowImpl,
  sleepImpl,
  requestImpl,
) {
  if (!requestState) {
    return requestImpl()
  }

  const previousRequest =
    requestState.requestQueue ??
    Promise.resolve()

  const currentRequest =
    previousRequest.then(
      async () => {
        await waitForRequestWindow(
          requestState,
          minimumRequestIntervalMs,
          nowImpl,
          sleepImpl,
        )

        recordRequestTime(
          requestState,
          nowImpl,
        )

        return requestImpl()
      },
    )

  requestState.requestQueue =
    currentRequest.then(
      () => undefined,
      () => undefined,
    )

  return currentRequest
}

// -----------------------------------------------------------------------------
// Cache helpers
// -----------------------------------------------------------------------------

function getCachedXml(
  cache,
  cacheKey,
  cacheTtlMs,
  currentTime,
) {
  if (!cache) {
    return null
  }

  const cachedEntry =
    cache.get(cacheKey)

  if (!cachedEntry) {
    return null
  }

  const cacheAge =
    currentTime -
    cachedEntry.cachedAt

  if (cacheAge >= cacheTtlMs) {
    cache.delete(cacheKey)
    return null
  }

  return cachedEntry.xml
}

function cacheXml(
  cache,
  cacheKey,
  xml,
  currentTime,
) {
  if (!cache) {
    return
  }

  cache.set(
    cacheKey,
    {
      xml,
      cachedAt: currentTime,
    },
  )
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
    cache = null,
    cacheTtlMs =
      DEFAULT_CACHE_TTL_MS,
    nowImpl = Date.now,
    requestState = null,
    minimumRequestIntervalMs =
      DEFAULT_MINIMUM_REQUEST_INTERVAL_MS,
  } = {},
) {
  if (!token) {
    throw new Error(
      'BGG API token is required',
    )
  }

  if (
    !Array.isArray(ids) ||
    ids.length === 0
  ) {
    throw new Error(
      'At least one BGG id is required',
    )
  }

  if (
    ids.length >
    MAX_IDS_PER_REQUEST
  ) {
    throw new Error(
      `BGG thing requests support a maximum of ${MAX_IDS_PER_REQUEST} ids`,
    )
  }

  const idList = ids.join(',')

  const url =
    `${BGG_API_BASE_URL}/thing` +
    `?id=${idList}&stats=1`

  const cacheKey = url

  const cachedXml = getCachedXml(
    cache,
    cacheKey,
    cacheTtlMs,
    nowImpl(),
  )

  if (cachedXml !== null) {
    return cachedXml
  }

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt += 1
  ) {
    const response =
      await runPacedRequest(
        requestState,
        minimumRequestIntervalMs,
        nowImpl,
        sleepImpl,
        () =>
          fetchImpl(
            url,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          ),
      )

    if (response.ok) {
      const xml =
        await response.text()

      cacheXml(
        cache,
        cacheKey,
        xml,
        nowImpl(),
      )

      return xml
    }

    const shouldRetry =
      isTemporaryFailure(
        response.status,
      ) &&
      attempt < MAX_ATTEMPTS

    if (!shouldRetry) {
  const error =
    new Error(
      `BGG API request failed with status ${response.status}`,
    )

  if (
    isTemporaryFailure(
      response.status,
    )
  ) {
    error.code =
      'BGG_UNAVAILABLE'
  }

  throw error
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