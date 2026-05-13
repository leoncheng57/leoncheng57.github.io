import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

// Handle GitHub Pages 404 redirect for client-side routing
const params = new URLSearchParams(window.location.search)
const redirectPath = params.get('p')
if (redirectPath) {
  window.history.replaceState(null, '', redirectPath)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
