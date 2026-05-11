import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
};

export const loginRequest = {
  scopes: [import.meta.env.VITE_ENTRA_API_SCOPE || 'api://<your-api-client-id>/.default'],
};

export const msalInstance = new PublicClientApplication(msalConfig);
