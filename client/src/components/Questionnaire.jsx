import { useEffect, useRef, useState } from 'react'

const timeOptions = [
  {
    value: 'up-to-20',
    label: 'Up to 20 minutes',
  },
  {
    value: 'up-to-30',
    label: 'About 30 minutes',
  },
  {
    value: 'up-to-60',
    label: 'About 45–60 minutes',
  },
  {
    value: 'up-to-120',
    label: 'About 1–2 hours',
  },
  {
    value: 'over-120',
    label: 'More than 2 hours',
  },
  {
    value: 'no-preference',
    label: 'No preference',
  },
]

const complexityOptions = [
  {
    value: 'light',
    label: 'Light and easy — quick to learn, with simple decisions',
  },
  {
    value: 'some-strategy',
    label: 'Some strategy — easy to learn, but still gives you things to think about',
  },
  {
    value: 'moderate',
    label: 'Moderately challenging — more rules, planning and meaningful decisions',
  },
  {
    value: 'deep',
    label: 'Deep and challenging — lots to think about, with more rules and strategy',
  },
  {
    value: 'no-preference',
    label: 'Not sure / no preference',
  },
]

const moodOptions = [
  {
    value: 'relaxed',
    label: 'Relaxed & easy-going',
  },
  {
    value: 'social',
    label: 'Social & lively',
  },
  {
    value: 'competitive',
    label: 'Competitive',
  },
  {
    value: 'cooperative',
    label: 'Cooperative',
  },
  {
    value: 'strategic',
    label: 'Strategic & thoughtful',
  },
  {
    value: 'immersive',
    label: 'Immersive & thematic',
  },
  {
    value: 'chaotic',
    label: 'Funny, silly & chaotic',
  },
  {
    value: 'no-preference',
    label: 'No preference',
  },
]

const styleOptions = [
  {
    value: 'working-things-out',
    label: 'Solving & figuring things out',
  },
  {
    value: 'building-collecting',
    label: 'Collecting & building',
  },
  {
    value: 'planning-managing',
    label: 'Planning & managing',
  },
  {
    value: 'talking-guessing',
    label: 'Talking, guessing & reading people',
  },
  {
    value: 'working-together',
    label: 'Working together',
  },
  {
    value: 'competing-directly',
    label: 'Competing directly',
  },
  {
    value: 'theme-story',
    label: 'Theme & story',
  },
  {
    value: 'quick-simple',
    label: 'Quick & simple',
  },
  {
    value: 'no-preference',
    label: 'No preference',
  },
]

const contentOptions = [
  {
    value: 'family-friendly',
    label: 'Family-friendly only',
  },
  {
    value: 'mature-okay',
    label: 'Mature or adult humour is okay',
  },
  {
    value: 'no-preference',
    label: 'No preference',
  },
]

function Questionnaire({ onBackToStart }) {
  const [currentStep, setCurrentStep] = useState(1)

  const [answers, setAnswers] = useState({
    players: '',
    time: '',
    complexity: '',
    mood: '',
    style: '',
    youngestPlayerAge: '',
    contentPreference: '',
  })

  const [error, setError] = useState('')
  const [completeMessage, setCompleteMessage] = useState('')
  const questionHeadingRef = useRef(null)

  useEffect(() => {
    questionHeadingRef.current?.focus()
  }, [currentStep])

  function updateAnswer(field, value) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [field]: value,
    }))

    setError('')
    setCompleteMessage('')
  }

  function changePlayers(amount) {
    const currentValue = Number(answers.players) || 0
    const nextValue = Math.max(1, currentValue + amount)

    updateAnswer('players', nextValue)
  }

  function handlePlayerInput(event) {
    updateAnswer('players', event.target.value)
  }

  function handleAgeInput(event) {
    updateAnswer('youngestPlayerAge', event.target.value)
  }

  function validateCurrentStep() {
    if (currentStep === 1) {
      const playerCount = Number(answers.players)

      if (!Number.isInteger(playerCount) || playerCount < 1) {
        return 'Enter the number of people who will be playing.'
      }
    }

    if (currentStep === 2 && !answers.time) {
      return 'Choose how long you would like to play for.'
    }

    if (currentStep === 3 && !answers.complexity) {
      return 'Choose how involved you would like the game to feel.'
    }

    if (currentStep === 4 && !answers.mood) {
      return 'Choose the kind of experience you are in the mood for.'
    }

    if (currentStep === 5 && !answers.style) {
      return 'Choose the style of game that sounds fun to you.'
    }

    if (currentStep === 6) {
      const youngestAge = Number(answers.youngestPlayerAge)

      if (
        answers.youngestPlayerAge === '' ||
        !Number.isInteger(youngestAge) ||
        youngestAge < 0
      ) {
        return 'Enter the age of the youngest person who will be playing.'
      }

      if (!answers.contentPreference) {
        return 'Choose the type of content that is okay for your group.'
      }
    }

    return ''
  }

  function handleNext() {
    const validationError = validateCurrentStep()

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')

    if (currentStep === 1) {
      setAnswers((previousAnswers) => ({
        ...previousAnswers,
        players: Number(previousAnswers.players),
      }))
    }

    if (currentStep === 6) {
      const completedAnswers = {
        ...answers,
        youngestPlayerAge: Number(answers.youngestPlayerAge),
      }

      setAnswers(completedAnswers)

      console.log('Completed questionnaire:', completedAnswers)

      setCompleteMessage(
        'Questionnaire complete. The review screen will be added next.',
      )

      return
    }

    setCurrentStep((step) => step + 1)
  }

  function handleBack() {
    setError('')
    setCompleteMessage('')

    if (currentStep === 1) {
      onBackToStart()
      return
    }

    setCurrentStep((step) => step - 1)
  }

  function renderChoiceList(name, value, options, legend) {
    return (
      <fieldset
        className="choice-fieldset"
        aria-describedby={error ? 'question-error' : undefined}
      >
        <legend className="visually-hidden">{legend}</legend>

        <div className="choice-list">
          {options.map((option) => (
            <label className="choice-option" key={option.value}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(event) => updateAnswer(name, event.target.value)}
              />

              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  return (
    <main className="app-page">
      <section className="question-card">
        <p className="question-progress">
          Question {currentStep} of 6
        </p>

        {currentStep === 1 && (
          <>
            <h1
              id="question-heading"
              ref={questionHeadingRef}
              tabIndex={-1}
            >
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
                disabled={Number(answers.players) <= 1}
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
                  value={answers.players}
                  onChange={handlePlayerInput}
                  aria-describedby={error ? 'question-error' : undefined}
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
          </>
        )}

        {currentStep === 2 && (
          <>
            <h1
              id="question-heading"
              ref={questionHeadingRef}
              tabIndex={-1}
            >
              How long do you want to play for?
            </h1>

            <p className="question-helper">
              Choose the amount of time you'd be happy spending on one game.
            </p>

            {renderChoiceList(
              'time',
              answers.time,
              timeOptions,
              'Available play time',
            )}
          </>
        )}

        {currentStep === 3 && (
          <>
            <h1
              id="question-heading"
              ref={questionHeadingRef}
              tabIndex={-1}
            >
              How involved do you want the game to feel?
            </h1>

            <p className="question-helper">
              Think about how much you want to learn and think during the
              game — not how experienced you are.
            </p>

            {renderChoiceList(
              'complexity',
              answers.complexity,
              complexityOptions,
              'Desired game complexity',
            )}
          </>
        )}

        {currentStep === 4 && (
          <>
            <h1
              id="question-heading"
              ref={questionHeadingRef}
              tabIndex={-1}
            >
              What kind of experience are you in the mood for?
            </h1>

            <p className="question-helper">
              Choose the option that best describes how you'd like the game
              to feel.
            </p>

            {renderChoiceList(
              'mood',
              answers.mood,
              moodOptions,
              'Desired game experience',
            )}
          </>
        )}

        {currentStep === 5 && (
          <>
            <h1
              id="question-heading"
              ref={questionHeadingRef}
              tabIndex={-1}
            >
              What sounds fun to you?
            </h1>

            <p className="question-helper">
              Don't worry about knowing board-game terms. Just choose the
              type of play that sounds most appealing.
            </p>

            {renderChoiceList(
              'style',
              answers.style,
              styleOptions,
              'Preferred play style',
            )}
          </>
        )}

        {currentStep === 6 && (
          <>
            <h1
              id="question-heading"
              ref={questionHeadingRef}
              tabIndex={-1}
            >
              Who will be playing?
            </h1>

            <p className="question-helper">
              We'll use the youngest player's age to avoid recommending games
              that may not suit everyone in your group.
            </p>

            <div className="age-input-group">
              <label htmlFor="youngest-player-age">
                How old is the youngest person playing?
              </label>

              <input
                id="youngest-player-age"
                type="number"
                min="0"
                step="1"
                value={answers.youngestPlayerAge}
                onChange={handleAgeInput}
                aria-describedby={error ? 'question-error' : undefined}
              />
            </div>

            <h2 className="content-heading">
              What kind of content is okay for your group?
            </h2>

            {renderChoiceList(
              'contentPreference',
              answers.contentPreference,
              contentOptions,
              'Content preference',
            )}
          </>
        )}

        {error && (
          <p id="question-error" className="form-error" role="alert">
            {error}
          </p>
        )}

        {completeMessage && (
          <p className="question-complete" role="status">
            {completeMessage}
          </p>
        )}

        <div className="question-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleBack}
          >
            Back
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleNext}
          >
            {currentStep === 6 ? 'Review answers' : 'Next'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default Questionnaire