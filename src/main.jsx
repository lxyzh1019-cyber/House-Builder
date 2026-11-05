import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as P from '@pascal-app/core'
import { builtinPlugin } from '@pascal-app/nodes'
import App from './app/App.jsx'

// Pascal node kinds must be registered once, before any scene is built.
const pluginReady = P.loadPlugin(builtinPlugin)
const store = import.meta.env.VITE_STORE === 'local' ? await import('./store-local.js') : await import('./store-firestore.js')

createRoot(document.getElementById('root')).render(<StrictMode><App store={store} pluginReady={pluginReady} /></StrictMode>)
