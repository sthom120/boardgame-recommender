import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking backend connection...')

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch('/api/health')

        if (!response.ok) {
          throw new Error('Backend returned an error')
        }

        const data = await response.json()
        setApiStatus(data.message)
      } catch {
        setApiStatus('Unable to reach the backend')
      }
    }

    checkBackend()
  }, [])

  return (
    <main>
      <h1>Board Game Recommender</h1>
      <p>Application scaffold</p>

      <section>
        <h2>Backend connection</h2>
        <p role="status">{apiStatus}</p>
      </section>
    </main>
  )
}

export default App