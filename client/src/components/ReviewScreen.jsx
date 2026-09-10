const timeLabels = {
  'up-to-20': 'Up to 20 minutes',
  'up-to-30': 'About 30 minutes',
  'up-to-60': 'About 45–60 minutes',
  'up-to-120': 'About 1–2 hours',
  'over-120': 'More than 2 hours',
  'no-preference': 'No preference',
}

const complexityLabels = {
  light: 'Light and easy',
  'some-strategy': 'Some strategy',
  moderate: 'Moderately challenging',
  deep: 'Deep and challenging',
  'no-preference': 'No preference',
}

const moodLabels = {
  relaxed: 'Relaxed & easy-going',
  social: 'Social & lively',
  competitive: 'Competitive',
  cooperative: 'Cooperative',
  strategic: 'Strategic & thoughtful',
  immersive: 'Immersive & thematic',
  chaotic: 'Funny, silly & chaotic',
  'no-preference': 'No preference',
}

const styleLabels = {
  'working-things-out': 'Solving & figuring things out',
  'building-collecting': 'Collecting & building',
  'planning-managing': 'Planning & managing',
  'talking-guessing': 'Talking, guessing & reading people',
  'working-together': 'Working together',
  'competing-directly': 'Competing directly',
  'theme-story': 'Theme & story',
  'quick-simple': 'Quick & simple',
  'no-preference': 'No preference',
}

const contentLabels = {
  'family-friendly': 'Family-friendly only',
  'mature-okay': 'Mature or adult humour is okay',
  'no-preference': 'No preference',
}

function ReviewScreen({ answers, onEdit }) {
  const reviewItems = [
    {
      label: 'Players',
      value: `${answers.players} ${answers.players === 1 ? 'person' : 'people'}`,
      step: 1,
    },
    {
      label: 'Play time',
      value: timeLabels[answers.time],
      step: 2,
    },
    {
      label: 'Complexity',
      value: complexityLabels[answers.complexity],
      step: 3,
    },
    {
      label: 'Experience',
      value: answers.mood.map((value) => moodLabels[value]).join(', '),
      step: 4,
    },
    {
      label: 'Play style',
      value: answers.style.map((value) => styleLabels[value]).join(', '),
      step: 5,
    },
    {
      label: 'Youngest player',
      value: `${answers.youngestPlayerAge} years old`,
      step: 6,
    },
    {
      label: 'Content',
      value: contentLabels[answers.contentPreference],
      step: 6,
    },
  ]

  return (
    <main className="app-page">
      <section className="review-card">
        <p className="question-progress">Almost there</p>

        <h1>Review your answers</h1>

        <p className="question-helper">
          Check everything looks right before we find games for your group.
        </p>

        <dl className="review-list">
          {reviewItems.map((item) => (
            <div className="review-item" key={item.label}>
              <div>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>

              <button
                type="button"
                className="review-change-button"
                onClick={() => onEdit(item.step)}
                aria-label={`Change ${item.label.toLowerCase()}`}
              >
                Change
              </button>
            </div>
          ))}
        </dl>

        <div className="question-actions">
          <button
            type="button"
            className="primary-button"
          >
            Find my games
          </button>
        </div>
      </section>
    </main>
  )
}

export default ReviewScreen