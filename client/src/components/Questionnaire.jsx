import { useState } from 'react'

function Questionnaire({ onBackToStart }) {
  const [players, setPlayers] = useState('')
  const [error, setError] = useState('')

  function changePlayers(amount) {
    const currentValue = Number(players) || 0
    const nextValue = Math.max(1, currentValue + amount)

    setPlayers(nextValue)
    setError('')
  }

  function handlePlayerInput(event) {
    const value = event.target.value

    setPlayers(value)
    setError('')
  }

  function handleNext() {
    const playerCount = Number(players)

    if (!Number.isInteger(playerCount) || playerCount < 1) {
      setError('Enter the number of people who will be playing.')
      return
    }

    // Question 2 will be connected here next.
    console.log('Players:', playerCount)
  }

  return (
    <main className="app-page">
      <section
        className="question-card"
        aria-labelledby="question-heading"
      >
        <p className="question-progress">Question 1 of 6</p>

        <h1 id="question-heading">
          How many people will be playing?
        </h1>

        <p className="question-helper">
          Include everyone who will be playing the game.
        </p>

        <div className="number-control">
          <button
            type="button"
            className="number-button"
            onClick={() => changePlayers(-1)}
            disabled={Number(players) <= 1}
            aria-label="Decrease number of players"
          >
            −
          </button>

          <label className="player-input-group">
            <span className="visually-hidden">
              Number of players
            </span>

            <input
              type="number"
              min="1"
              step="1"
              value={players}
              onChange={handlePlayerInput}
              aria-describedby={error ? 'players-error' : undefined}
              aria-invalid={error ? 'true' : 'false'}
            />
          </label>

          <button
            type="button"
            className="number-button"
            onClick={() => changePlayers(1)}
            aria-label="Increase number of players"
          >
            +
          </button>
        </div>

        {error && (
          <p id="players-error" className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="question-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onBackToStart}
          >
            Back
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  )
}

export default Questionnaire