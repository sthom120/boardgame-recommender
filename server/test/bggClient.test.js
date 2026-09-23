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