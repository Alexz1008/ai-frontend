import { PublicClientApplication } from '@azure/msal-browser';
import { getConfig } from '../config.js';

function createMsalConfig() {
  return {
    auth: {
      clientId: getConfig('ENTRA_CLIENT_ID'),
      authority: `https://login.microsoftonline.com/${getConfig('ENTRA_TENANT_ID')}`,
      redirectUri: window.location.origin,
    },
  };
}

export function getLoginRequest() {
  return {
    scopes: [getConfig('ENTRA_API_SCOPE') || 'api://<your-api-client-id>/.default'],
  };
}

// Keep backward-compatible named export; initialized after loadConfig() in main.jsx
export let msalInstance;

export function initializeMsal() {
  msalInstance = new PublicClientApplication(createMsalConfig());
  return msalInstance;
}
