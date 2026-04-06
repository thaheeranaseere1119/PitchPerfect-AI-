import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import RecordingPage from './pages/RecordingPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage from './pages/ResultsPage'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)
  const [analysisResult, setAnalysisResult] = useState(null)

  const toggleDark = () => {
    setDarkMode(d => !d)
    document.body.classList.toggle('light')
  }

  return (
    <BrowserRouter>
      <div className={darkMode ? 'dark' : ''}>
        <Navbar darkMode={darkMode} toggleDark={toggleDark} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/record" element={<RecordingPage setResult={setAnalysisResult} />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/results" element={<ResultsPage result={analysisResult} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
