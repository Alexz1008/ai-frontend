import { getLoginRequest, msalInstance } from '../auth/authConfig.js';
import { getConfig } from '../config.js';

// TODO: Remove hardcoded URL before production
const HARDCODED_API_URL = '';

function getApiUrl() {
  return (
    HARDCODED_API_URL ||
    window.__AI_CHAT_CONFIG__?.apiUrl ||
    getConfig('API_URL') ||
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
    // No account — redirect to login (page will reload after auth)
    await msalInstance.loginRedirect(getLoginRequest());
    return null;
  }
  const response = await msalInstance.acquireTokenSilent({
    ...getLoginRequest(),
    account: accounts[0],
  }).catch(() => msalInstance.acquireTokenRedirect(getLoginRequest()));
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
        body: JSON.stringify({
          input: messages.map((m) => ({ role: m.role, content: m.content })),
          agent_reference: {
            name: getConfig('AGENT_NAME') || 'EBCChatbot',
            version: getConfig('AGENT_VERSION') || '8',
            type: 'agent_reference',
          },
        }),
        signal,
      })
    )
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') || res.body?.getReader) {
        // Streaming response (SSE / chunked)
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          onToken(chunk);
        }
      } else {
        // JSON response (Responses API)
        const data = await res.json();
        const text = data.output_text || JSON.stringify(data);
        onToken(text);
      }

      onDone();
    })
    .catch((err) => {
      if (err.name === 'AbortError') return;
      onError(err);
    });
}
