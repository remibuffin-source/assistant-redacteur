import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SimplePreview from './components/SimplePreview'
import CalendarPage from './components/CalendarPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimplePreview />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="*" element={<SimplePreview />} />
      </Routes>
    </Router>
  )
}

export default App
