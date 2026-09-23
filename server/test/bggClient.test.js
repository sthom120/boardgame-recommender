const test = require('node:test')
const assert = require('node:assert/strict')

const {
  fetchBggThingsXml,
} = require('../integrations/bgg/bggClient')

test('fetches BGG thing data with bearer authentication', async () => {
  let capturedUrl
  let capturedOptions

  const fetchImpl = async (url, options) => {
    capturedUrl = url
    capturedOptions = options

    return {
      ok: true,
      status: 200,
      text: async () => '<items></items>',
    }
  }

  const xml = await fetchBggThingsXml(
    ['266192'],
    {
      token: 'test-token',
      fetchImpl,
    },
  )

  assert.equal(
    capturedUrl,
    'https://boardgamegeek.com/xmlapi2/thing?id=266192&stats=1',
  )

  assert.equal(
    capturedOptions.headers.Authorization,
    'Bearer test-token',
  )

  assert.equal(xml, '<items></items>')
})

test('supports multiple controlled BGG ids in one request', async () => {
  let capturedUrl

  const fetchImpl = async (url) => {
    capturedUrl = url

    return {
      ok: true,
      status: 200,
      text: async () => '<items></items>',
    }
  }

  await fetchBggThingsXml(
    ['178900', '266192', '30549'],
    {
      token: 'test-token',
      fetchImpl,
    },
  )

  assert.equal(
    capturedUrl,
    'https://boardgamegeek.com/xmlapi2/thing?id=178900,266192,30549&stats=1',
  )
})

test('rejects a request when the BGG API token is missing', async () => {
  await assert.rejects(
    () =>
      fetchBggThingsXml(
        ['266192'],
        {
          token: '',
          fetchImpl: async () => {
            throw new Error('fetch should not run')
          },
        },
      ),
    /BGG API token/,
  )
})

test('rejects requests containing more than twenty BGG ids', async () => {
  const ids = Array.from(
    { length: 21 },
    (_, index) => String(index + 1),
  )

  await assert.rejects(
    () =>
      fetchBggThingsXml(
        ids,
        {
          token: 'test-token',
          fetchImpl: async () => {
            throw new Error('fetch should not run')
          },
        },
      ),
    /20/,
  )
})

test('retries a temporary BGG failure and succeeds on the next attempt', async () => {
  let fetchCalls = 0
  const delays = []

  const fetchImpl = async () => {
    fetchCalls += 1

    if (fetchCalls === 1) {
      return {
        ok: false,
        status: 503,
      }
    }

    return {
      ok: true,
      status: 200,
      text: async () => '<items></items>',
    }
  }

  const sleepImpl = async (milliseconds) => {
    delays.push(milliseconds)
  }

  const xml = await fetchBggThingsXml(
    ['266192'],
    {
      token: 'test-token',
      fetchImpl,
      sleepImpl,
    },
  )

  assert.equal(fetchCalls, 2)
  assert.deepEqual(delays, [5000])
  assert.equal(xml, '<items></items>')
})

test('stops retrying after the maximum number of temporary failures', async () => {
  let fetchCalls = 0
  const delays = []

  const fetchImpl = async () => {
    fetchCalls += 1

    return {
      ok: false,
      status: 500,
    }
  }

  const sleepImpl = async (milliseconds) => {
    delays.push(milliseconds)
  }

  await assert.rejects(
    () =>
      fetchBggThingsXml(
        ['266192'],
        {
          token: 'test-token',
          fetchImpl,
          sleepImpl,
        },
      ),
    /status 500/,
  )

  assert.equal(fetchCalls, 3)

  assert.deepEqual(
    delays,
    [
      5000,
      10000,
    ],
  )
})

test('reuses a cached BGG response for an identical request', async () => {
  let fetchCalls = 0
  const cache = new Map()

  const fetchImpl = async () => {
    fetchCalls += 1

    return {
      ok: true,
      status: 200,
      text: async () =>
        '<items><item id="266192" /></items>',
    }
  }

  const firstXml = await fetchBggThingsXml(
    ['266192'],
    {
      token: 'test-token',
      fetchImpl,
      cache,
    },
  )

  const secondXml = await fetchBggThingsXml(
    ['266192'],
    {
      token: 'test-token',
      fetchImpl,
      cache,
    },
  )

  assert.equal(fetchCalls, 1)

  assert.equal(
    firstXml,
    '<items><item id="266192" /></items>',
  )

  assert.equal(secondXml, firstXml)
})

test('refetches BGG data after the cached response expires', async () => {
  let fetchCalls = 0
  let currentTime = 1000000

  const cache = new Map()

  const fetchImpl = async () => {
    fetchCalls += 1

    return {
      ok: true,
      status: 200,
      text: async () =>
        `<items call="${fetchCalls}"></items>`,
    }
  }

  const nowImpl = () => currentTime

  const firstXml = await fetchBggThingsXml(
    ['266192'],
    {
      token: 'test-token',
      fetchImpl,
      cache,
      cacheTtlMs: 1000,
      nowImpl,
    },
  )

  currentTime += 500

  const secondXml = await fetchBggThingsXml(
    ['266192'],
    {
      token: 'test-token',
      fetchImpl,
      cache,
      cacheTtlMs: 1000,
      nowImpl,
    },
  )

  assert.equal(fetchCalls, 1)
  assert.equal(secondXml, firstXml)

  currentTime += 600

  const thirdXml = await fetchBggThingsXml(
    ['266192'],
    {
      token: 'test-token',
      fetchImpl,
      cache,
      cacheTtlMs: 1000,
      nowImpl,
    },
  )

  assert.equal(fetchCalls, 2)

  assert.equal(
    thirdXml,
    '<items call="2"></items>',
  )
})