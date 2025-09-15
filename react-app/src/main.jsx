import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ConfigAPIPage from './components/ConfigAPIPage'
import CalendarPage from './components/CalendarPage'
import ResultsManagementPage from './components/ResultsManagementPage'
import AccountPage from './components/AccountPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/config-api" element={<ConfigAPIPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/results" element={<ResultsManagementPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
