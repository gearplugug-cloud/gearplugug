import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { KitProvider } from './context/KitContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <KitProvider>
        <App />
      </KitProvider>
    </BrowserRouter>
  </StrictMode>,
)
