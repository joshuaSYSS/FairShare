import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css' // <-- ADD THIS LINE
import { ResourceProvider } from './context/ResourceContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResourceProvider>
      <App />
    </ResourceProvider>
  </StrictMode>,
)