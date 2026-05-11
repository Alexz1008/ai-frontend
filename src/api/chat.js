import { loginRequest, msalInstance } from '../auth/authConfig.js';

// TODO: Remove hardcoded URL before production
const HARDCODED_API_URL = '';

function getApiUrl() {
  return (
    HARDCODED_API_URL ||
    window.__AI_CHAT_CONFIG__?.apiUrl ||
    import.meta.env.VITE_API_URL ||
    '/api/chat'
  );
}

async function getAccessToken() {
  // Use pre-supplied token from parent app (embedded iframe/script scenario)
  const externalToken = window.__AI_CHAT_CONFIG__?.token;
  if (externalToken) {
    return externalToken;
  }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    const response = await msalInstance.loginPopup(loginRequest);
    return response.accessToken;
  }
  const response = await msalInstance.acquireTokenSilent({
    ...loginRequest,
    account: accounts[0],
  }).catch(() => msalInstance.acquireTokenPopup(loginRequest));
  return response.accessToken;
}

export function streamChat(messages, { onToken, onDone, onError, signal }) {
  const url = getApiUrl();

  getAccessToken()
    .then((token) =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ messages }),
        signal,
      })
    )
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        onToken(chunk);
      }

      onDone();
    })
    .catch((err) => {
      if (err.name === 'AbortError') return;
      onError(err);
    });
}
