import React from 'react'

function App() {
  return React.createElement('div', {
    style: {
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }
  },
    React.createElement('div', {
      style: {
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }
    },
      React.createElement('h1', {
        style: { color: '#4CAF50', marginBottom: '20px' }
      }, '🎉 Assistant Rédactionnel - Test Réussi !'),

      React.createElement('p', {
        style: { fontSize: '1.2rem', color: '#666', marginBottom: '30px' }
      }, 'React fonctionne parfaitement ! L\'interface se charge correctement.'),

      React.createElement('div', {
        style: {
          backgroundColor: '#e8f5e8',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #4CAF50'
        }
      },
        React.createElement('h2', { style: { color: '#2E7D32', margin: '0 0 10px 0' } }, '✅ Test Réussi'),
        React.createElement('p', { style: { margin: 0, color: '#2E7D32' } }, 'L\'application React se charge sans erreur !')
      ),

      React.createElement('div', {
        style: { marginTop: '30px' }
      },
        React.createElement('button', {
          onClick: () => alert('React fonctionne !'),
          style: {
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        }, '🧪 Tester React')
      )
    )
  )
}

export default App