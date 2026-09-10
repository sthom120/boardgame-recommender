import { useState } from 'react'
import './App.css'
import LandingScreen from './components/LandingScreen'
import Questionnaire from './components/Questionnaire'
import ReviewScreen from './components/ReviewScreen'

const initialAnswers = {
  players: '',
  time: '',
  complexity: '',
  mood: [],
  style: [],
  youngestPlayerAge: '',
  contentPreference: '',
}

function App() {
  const [screen, setScreen] = useState('landing')
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState(initialAnswers)

  function editAnswer(step) {
  setCurrentStep(step)
  setScreen('questionnaire')
}

  function startQuestionnaire() {
    setScreen('questionnaire')
  }

  function returnToLanding() {
    setScreen('landing')
  }

  function showReview() {
    setScreen('review')
  }

  if (screen === 'landing') {
    return <LandingScreen onStart={startQuestionnaire} />
  }

  if (screen === 'questionnaire') {
    return (
      <Questionnaire
        answers={answers}
        setAnswers={setAnswers}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onBackToStart={returnToLanding}
        onReview={showReview}
      />
    )
  }

  if (screen === 'review') {
  return (
    <ReviewScreen
      answers={answers}
      onEdit={editAnswer}
    />
  )
}

return null
}

export default App