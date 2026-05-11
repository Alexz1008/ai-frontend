import { MsalProvider } from '@azure/msal-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { initializeMsal } from './auth/authConfig.js';
import { loadConfig } from './config.js';
import './index.css';

// Allow runtime config via URL params (useful when embedded via iframe)
const params = new URLSearchParams(window.location.search);
const apiUrl = params.get('apiUrl');
if (apiUrl) {
  window.__AI_CHAT_CONFIG__ = { ...window.__AI_CHAT_CONFIG__, apiUrl };
}

// Load runtime config before initializing MSAL
await loadConfig();
const msalInstance = initializeMsal();
await msalInstance.initialize();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>,
)
