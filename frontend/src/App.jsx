import { useState } from 'react'
import Login from './Login.jsx'
import Signup from './Signup.jsx'

function App() {
  const [page, setPage] = useState('login')

  if (page === 'signup') {
    return <Signup onSwitchToLogin={() => setPage('login')} />
  }

  return <Login onSwitchToSignup={() => setPage('signup')} />
}

export default App
