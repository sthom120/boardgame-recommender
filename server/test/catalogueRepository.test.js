const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {
  DatabaseSync,
} = require('node:sqlite')

const {
  createCatalogueRepository,
} = require(
  '../data/catalogue/catalogueRepository',
)

// -----------------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------------

const schema = fs.readFileSync(
  path.join(
    __dirname,
    '../data/catalogue/schema.sql',
  ),
  'utf8',
)

function createDatabase() {
  const db = new DatabaseSync(
    ':memory:',
  )

  db.exec(schema)

  return db
}

function createGame() {
  return {
    id: 'game-30549',

    source: {
      provider: 'boardgamegeek',
      externalId: '30549',
    },

    title: 'Pandemic',

    description:
      'Players work together to stop outbreaks.',

    yearPublished: 2008,

    images: {
      thumbnailUrl:
        'https://example.com/thumb.jpg',

      imageUrl:
        'https://example.com/image.jpg',
    },

    playerRange: {
      min: 2,
      max: 4,
    },

    playTime: {
      minMinutes: 45,
      maxMinutes: 45,
    },

    age: {
      publisherMinimum: 8,

      communityPoll: [
        {
          age: '10',
          votes: 100,
        },
      ],
    },

    complexity: {
      average: 2.39,
    },

    playerCountPoll: [
      {
        players: '3',
        bestVotes: 210,
        recommendedVotes: 80,
        notRecommendedVotes: 10,
      },
    ],

    mechanics: [
      'Cooperative Game',
      'Hand Management',
    ],

    categories: [
      'Medical',
    ],

    ratings: {
      bayesianAverage: 7.5,
      usersRated: 130000,
    },

    relationships: {
      baseGameIds: [],
    },

    content: {
      classification:
        'family-friendly',
    },
  }
}

// -----------------------------------------------------------------------------
// Repository tests
// -----------------------------------------------------------------------------

test(
  'stores and reconstructs a normalized game',
  () => {
    const db = createDatabase()

    try {
      const repository =
        createCatalogueRepository({
          db,
        })

      const game = createGame()

      repository.upsertGame(game, {
        importedAt:
          '2026-10-09T00:00:00Z',
      })

      const games =
        repository.getIncludedGames()

      assert.deepEqual(
        games,
        [game],
      )
    } finally {
      db.close()
    }
  },
)

test(
  'preserves Shuffled content classification when a game is re-imported',
  () => {
    const db = createDatabase()

    try {
      const repository =
        createCatalogueRepository({
          db,
        })

      const game = createGame()

      repository.upsertGame(game, {
        importedAt:
          '2026-10-09T00:00:00Z',
      })

      db.prepare(`
        UPDATE catalogue_entries
        SET content_classification = ?
        WHERE game_id = ?
      `).run(
        'mature',
        game.id,
      )

      const updatedGame = {
        ...game,
        title:
          'Pandemic Updated',
      }

      repository.upsertGame(
        updatedGame,
        {
          importedAt:
            '2026-10-10T00:00:00Z',
        },
      )

      const games =
        repository.getIncludedGames()

      assert.equal(
        games[0].title,
        'Pandemic Updated',
      )

      assert.equal(
        games[0].content
          .classification,
        'mature',
      )
    } finally {
      db.close()
    }
  },
)