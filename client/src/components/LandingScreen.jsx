function LandingScreen({ onStart }) {
  return (
    <main className="landing-page">
      <section className="landing-card" aria-labelledby="landing-heading">
        <p className="app-name">Board Game Recommender</p>

        <h1 id="landing-heading">
          Find a board game that fits your group
        </h1>

        <p className="landing-intro">
          Answer a few quick questions about who's playing, how much time you
          have, and what kind of game you feel like playing.
        </p>

        <button type="button" className="primary-button" onClick={onStart}>
          Find my game
        </button>

        <p className="landing-reassurance">
          No board-game knowledge needed.
        </p>
      </section>
    </main>
  )
}

export default LandingScreen