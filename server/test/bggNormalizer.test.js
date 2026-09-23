const test = require('node:test')
const assert = require('node:assert/strict')

const {
  normalizeBggThingsXml,
} = require('../integrations/bgg/bggNormalizer')

test('normalizes basic BGG thing data into the app-owned game model', () => {
  const xml = `
    <items>
      <item type="boardgame" id="266192">
        <name
          type="primary"
          sortindex="1"
          value="Wingspan"
        />
        <description>
          A strategy game about attracting birds.
        </description>
        <yearpublished value="2019" />
        <minplayers value="1" />
        <maxplayers value="5" />
        <minplaytime value="40" />
        <maxplaytime value="70" />
        <minage value="10" />
      </item>
    </items>
  `

  const games = normalizeBggThingsXml(xml)

  assert.equal(games.length, 1)

  const game = games[0]

  assert.equal(game.id, 'game-266192')

  assert.deepEqual(game.source, {
    provider: 'boardgamegeek',
    externalId: '266192',
  })

  assert.equal(game.title, 'Wingspan')
  assert.equal(game.yearPublished, 2019)

  assert.deepEqual(game.playerRange, {
    min: 1,
    max: 5,
  })

  assert.deepEqual(game.playTime, {
    minMinutes: 40,
    maxMinutes: 70,
  })

  assert.equal(
    game.age.publisherMinimum,
    10,
  )
})

test('normalizes images, complexity, mechanics, categories and ratings', () => {
  const xml = `
    <items>
      <item type="boardgame" id="266192">
        <name
          type="primary"
          value="Wingspan"
        />

        <thumbnail>
          https://example.com/wingspan-thumb.jpg
        </thumbnail>

        <image>
          https://example.com/wingspan.jpg
        </image>

        <link
          type="boardgamemechanic"
          id="2041"
          value="Open Drafting"
        />

        <link
          type="boardgamemechanic"
          id="2040"
          value="Hand Management"
        />

        <link
          type="boardgamecategory"
          id="1089"
          value="Animals"
        />

        <statistics>
          <ratings>
            <usersrated value="90000" />
            <bayesaverage value="7.93" />
            <averageweight value="2.48" />
          </ratings>
        </statistics>
      </item>
    </items>
  `

  const [game] = normalizeBggThingsXml(xml)

  assert.deepEqual(game.images, {
    thumbnailUrl:
      'https://example.com/wingspan-thumb.jpg',
    imageUrl:
      'https://example.com/wingspan.jpg',
  })

  assert.deepEqual(game.complexity, {
    average: 2.48,
  })

  assert.deepEqual(game.mechanics, [
    'Open Drafting',
    'Hand Management',
  ])

  assert.deepEqual(game.categories, [
    'Animals',
  ])

  assert.deepEqual(game.ratings, {
    bayesianAverage: 7.93,
    usersRated: 90000,
  })
})

