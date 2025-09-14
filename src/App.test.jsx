import { render, screen } from '@testing-library/react'
import App from './App'

test('renders Assistant Rédacteur title', () => {
  render(<App />)
  const titleElement = screen.getByText(/Assistant Rédacteur/i)
  expect(titleElement).toBeInTheDocument()
})

test('renders generate button', () => {
  render(<App />)
  const buttonElement = screen.getByText(/Lancer la génération/i)
  expect(buttonElement).toBeInTheDocument()
})