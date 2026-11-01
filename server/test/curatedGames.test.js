
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

test(
  'curated catalogue contains valid, unique BGG IDs',
  () => {
    const filePath = path.join(
      __dirname,
      '../data/catalogue/curatedGames.json',
    )

    const games = JSON.parse(
      fs.readFileSync(filePath, 'utf8'),
    )

    assert.ok(Array.isArray(games))
    assert.ok(games.length > 0)

    const ids = games.map((game) => game.bggId)

    for (const game of games) {
      assert.match(game.bggId, /^[1-9]\d*$/)
      assert.ok(
        typeof game.name === 'string' &&
        game.name.trim().length > 0,
      )
    }

    assert.equal(
      new Set(ids).size,
      ids.length,
    )
  },
)
