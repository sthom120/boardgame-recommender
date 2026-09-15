function formatPlayers(players) {
  if (!players || players.min == null || players.max == null) {
    return 'Player count unavailable'
  }

  if (players.min === players.max) {
    return `${players.min} ${players.min === 1 ? 'player' : 'players'}`
  }

  return `${players.min}–${players.max} players`
}

function formatPlayTime(playTime) {
  if (!playTime) {
    return 'Play time unavailable'
  }

  const { minMinutes, maxMinutes } = playTime

  if (minMinutes == null && maxMinutes == null) {
    return 'Play time unavailable'
  }

  if (minMinutes == null) {
    return `Up to ${maxMinutes} minutes`
  }

  if (maxMinutes == null) {
    return `${minMinutes}+ minutes`
  }

  if (minMinutes === maxMinutes) {
    return `${minMinutes} minutes`
  }

  return `${minMinutes}–${maxMinutes} minutes`
}

function formatAge(age) {
  if (!age || age.publisherMinimum == null) {
    return 'Age guidance unavailable'
  }

  return `Ages ${age.publisherMinimum}+`
}

function ResultsScreen({ response, onChangeAnswers }) {
  const recommendations = response?.recommendations ?? []
  const resultState = response?.resultState ?? 'no-matches'

  let heading = 'Games that could fit your group'
  let resultMessage = `We found ${recommendations.length} ${
    recommendations.length === 1 ? 'game' : 'games'
  } based on your answers.`

  if (resultState === 'limited-matches') {
    heading = 'We found a few possible matches'
    resultMessage =
      'Only a small number of games matched your answers closely. You can try these, or adjust your answers to see more options.'
  }

  if (resultState === 'no-matches') {
    heading = 'We could not find a strong match'
    resultMessage =
      'Your answers created a very specific combination. Try changing one or two preferences and we will look again.'
  }

  return (
    <main className="app-page">
      <section className="results-page">
        <header className="results-header">
          <p className="question-progress">Your recommendations</p>

          <h1 tabIndex={-1}>{heading}</h1>

          <p className="question-helper" role="status" aria-live="polite">
            {resultMessage}
          </p>

          {resultState !== 'no-matches' && (
  <button
    type="button"
    className="secondary-button"
    onClick={onChangeAnswers}
  >
    Change answers
  </button>
)}
        </header>

        {resultState === 'no-matches' && (
          <div className="no-results-card">
            <h2>Try broadening your search</h2>

            <p>
              Changing play time, complexity, mood or play style may give us
              more games to work with.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onChangeAnswers}
            >
              Review my answers
            </button>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="results-list">
            {recommendations.map((game) => (
              <article className="recommendation-card" key={game.gameId}>
                <div className="recommendation-image-wrapper">
                  {game.imageUrl ? (
                    <img
                      className="recommendation-image"
                      src={game.imageUrl}
                      alt=""
                    />
                  ) : (
                    <div
                      className="recommendation-image-placeholder"
                      aria-label="Game image unavailable"
                    >
                      Image unavailable
                    </div>
                  )}
                </div>

                <div className="recommendation-content">
                  <p className="match-label">{game.matchLabel}</p>

                  <h2>{game.title}</h2>

                  {game.summary && (
                    <p className="recommendation-summary">{game.summary}</p>
                  )}

                  <dl className="recommendation-facts">
                    <div>
                      <dt>Players</dt>
                      <dd>{formatPlayers(game.players)}</dd>
                    </div>

                    <div>
                      <dt>Time</dt>
                      <dd>{formatPlayTime(game.playTime)}</dd>
                    </div>

                    <div>
                      <dt>Complexity</dt>
                      <dd>{game.complexity?.label ?? 'Unknown'}</dd>
                    </div>

                    <div>
                      <dt>Age</dt>
                      <dd>{formatAge(game.age)}</dd>
                    </div>
                  </dl>

                  {game.matchReasons?.length > 0 && (
                    <div className="match-reasons">
                      <h3>Why it fits you</h3>

                      <ul>
                        {game.matchReasons.slice(0, 2).map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {game.caveats?.length > 0 && (
                    <div className="recommendation-caveats">
                      <h3>Good to know</h3>

                      <ul>
                        {game.caveats.map((caveat) => (
                          <li key={caveat}>{caveat}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <details className="why-details">
                    <summary>Why this game?</summary>

                    {game.matchReasons?.length > 0 ? (
                      <ul>
                        {game.matchReasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No additional match details are available yet.</p>
                    )}
                  </details>

                  {game.detailsUrl && (
                    <a
                      className="bgg-link"
                      href={game.detailsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View this game on BoardGameGeek
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default ResultsScreen