const fs = require('fs')
const path = require('path')

function loadMockGames() {
  const filePath = path.join(
    __dirname,
    '..',
    '..',
    'fixtures',
    'mock-games.json',
  )

  const fileContents = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(fileContents)
}

module.exports = {
  loadMockGames,
}
