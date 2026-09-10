import { useState } from 'react'
import './App.css'
import LandingScreen from './components/LandingScreen'
import Questionnaire from './components/Questionnaire'

function App() {
  const [hasStarted, setHasStarted] = useState(false)

  if (!hasStarted) {
    return <LandingScreen onStart={() => setHasStarted(true)} />
  }

  return (
    <Questionnaire onBackToStart={() => setHasStarted(false)} />
  )
}

export default App