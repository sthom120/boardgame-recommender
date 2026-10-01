const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const {
  normalizeBggThingsXml,
} = require('../integrations/bgg/bggNormalizer')

// -----------------------------------------------------------------------------
// Basic BGG game normalisation
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// BGG metadata normalisation
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// BGG community poll normalisation
// -----------------------------------------------------------------------------

test('normalizes player-count and community age polls while preserving source labels', () => {
  const xml = `
    <items>
      <item type="boardgame" id="266192">
        <name
          type="primary"
          value="Wingspan"
        />

        <poll
          name="suggested_numplayers"
          title="User Suggested Number of Players"
          totalvotes="100"
        >
          <results numplayers="1">
            <result
              value="Best"
              numvotes="20"
            />
            <result
              value="Recommended"
              numvotes="60"
            />
            <result
              value="Not Recommended"
              numvotes="20"
            />
          </results>

          <results numplayers="5+">
            <result
              value="Best"
              numvotes="10"
            />
            <result
              value="Recommended"
              numvotes="30"
            />
            <result
              value="Not Recommended"
              numvotes="60"
            />
          </results>
        </poll>

        <poll
          name="suggested_playerage"
          title="User Suggested Player Age"
          totalvotes="80"
        >
          <results>
            <result
              value="8"
              numvotes="25"
            />
            <result
              value="10"
              numvotes="40"
            />
            <result
              value="12"
              numvotes="15"
            />
          </results>
        </poll>
      </item>
    </items>
  `

  const [game] = normalizeBggThingsXml(xml)

  assert.deepEqual(
    game.playerCountPoll,
    [
      {
        players: '1',
        bestVotes: 20,
        recommendedVotes: 60,
        notRecommendedVotes: 20,
      },
      {
        players: '5+',
        bestVotes: 10,
        recommendedVotes: 30,
        notRecommendedVotes: 60,
      },
    ],
  )

  assert.deepEqual(
    game.age.communityPoll,
    [
      {
        age: '8',
        votes: 25,
      },
      {
        age: '10',
        votes: 40,
      },
      {
        age: '12',
        votes: 15,
      },
    ],
  )
})

// -----------------------------------------------------------------------------
// BGG expansion relationship normalisation
// -----------------------------------------------------------------------------

test('normalizes inbound expansion relationships as base-game ids', () => {
  const xml = `
    <items>
      <item type="boardgame" id="290448">
        <name
          type="primary"
          value="Wingspan: European Expansion"
        />

        <link
          type="boardgameexpansion"
          id="266192"
          value="Wingspan"
          inbound="true"
        />

        <link
          type="boardgameexpansion"
          id="999999"
          value="A Related Expansion"
        />
      </item>
    </items>
  `

  const [game] = normalizeBggThingsXml(xml)

  assert.deepEqual(
    game.relationships,
    {
      baseGameIds: [
        'game-266192',
      ],
    },
  )
})

// -----------------------------------------------------------------------------
// Missing-data and UTF-8 normalisation
// -----------------------------------------------------------------------------

test('preserves predictable missing values without fabricating BGG data', () => {
  const xml = `
    <items>
      <item type="boardgame" id="129622">
        <name
          type="primary"
          value="Love Letter"
        />
      </item>
    </items>
  `

  const [game] = normalizeBggThingsXml(xml)

  assert.equal(game.description, null)
  assert.equal(game.yearPublished, null)

  assert.deepEqual(game.images, {
    thumbnailUrl: null,
    imageUrl: null,
  })

  assert.deepEqual(game.playerRange, {
    min: null,
    max: null,
  })

  assert.deepEqual(game.playTime, {
    minMinutes: null,
    maxMinutes: null,
  })

  assert.deepEqual(game.age, {
    publisherMinimum: null,
    communityPoll: [],
  })

  assert.deepEqual(game.complexity, {
    average: null,
  })

  assert.deepEqual(game.playerCountPoll, [])
  assert.deepEqual(game.mechanics, [])
  assert.deepEqual(game.categories, [])

  assert.deepEqual(game.ratings, {
    bayesianAverage: null,
    usersRated: null,
  })

  assert.deepEqual(game.relationships, {
    baseGameIds: [],
  })

  assert.deepEqual(game.content, {
    classification: 'unknown',
  })
})

test('preserves UTF-8 characters and decodes XML entities', () => {
  const xml = `
    <items>
      <item type="boardgame" id="123456">
        <name
          type="primary"
          value="Café – Édition spéciale"
        />

        <description>
          Crème brûlée &amp; piñata.
        </description>
      </item>
    </items>
  `

  const [game] = normalizeBggThingsXml(xml)

  assert.equal(
    game.title,
    'Café – Édition spéciale',
  )

  assert.equal(
    game.description,
    'Crème brûlée & piñata.',
  )
})

// -----------------------------------------------------------------------------
// Representative BGG fixture normalisation
// -----------------------------------------------------------------------------

test('normalizes representative records from the BGG test matrix', () => {
  const fixturePath = path.join(
    __dirname,
    'fixtures',
    'bgg-representative-things.xml',
  )

  const xml = fs.readFileSync(
    fixturePath,
    'utf8',
  )

  const games = normalizeBggThingsXml(xml)

  assert.equal(games.length, 3)

  const wingspan = games.find(
    (game) =>
      game.id === 'game-266192',
  )

  const underFallingSkies = games.find(
    (game) =>
      game.id === 'game-306735',
  )

  const europeanExpansion = games.find(
    (game) =>
      game.id === 'game-290448',
  )

  assert.ok(wingspan)
  assert.ok(underFallingSkies)
  assert.ok(europeanExpansion)

  assert.equal(
    wingspan.title,
    'Wingspan',
  )

  assert.deepEqual(
    wingspan.playerRange,
    {
      min: 1,
      max: 5,
    },
  )

  assert.equal(
    wingspan.complexity.average,
    2.4815,
  )

  assert.deepEqual(
    underFallingSkies.playerRange,
    {
      min: 1,
      max: 1,
    },
  )

  assert.equal(
    underFallingSkies.playerCountPoll[0].players,
    '1+',
  )

  assert.deepEqual(
    europeanExpansion.relationships,
    {
      baseGameIds: [
        'game-266192',
      ],
    },
  )
})