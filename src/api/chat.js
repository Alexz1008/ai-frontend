import { getLoginRequest, msalInstance } from '../auth/authConfig.js';
import { getConfig } from '../config.js';

// TODO: Remove hardcoded URL before production
const HARDCODED_API_URL = '';

function shouldSkipEntraAuth() {
  const flag = (getConfig('SKIP_LOCAL_ENTRA') || '').toLowerCase();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return false;
}

function getManualAccessToken() {
  const tokenFromEmbed = window.__AI_CHAT_CONFIG__?.token || '';
  const tokenFromConfig = getConfig('DEV_ACCESS_TOKEN') || '';
  const tokenFromStorage =
    window.sessionStorage.getItem('DEV_ACCESS_TOKEN') ||
    window.localStorage.getItem('DEV_ACCESS_TOKEN') ||
    '';
  const raw = tokenFromEmbed || tokenFromConfig || tokenFromStorage;
  if (!raw) return null;
  return raw.startsWith('Bearer ') ? raw.slice('Bearer '.length) : raw;
}

function getApiUrl() {
  return (
    HARDCODED_API_URL ||
    window.__AI_CHAT_CONFIG__?.apiUrl ||
    getConfig('API_URL') ||
    '/api/chat'
  );
}

function extractAssistantText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text;
  }

  const message = (data?.output || []).find(
    (item) => item?.type === 'message' && item?.role === 'assistant',
  );
  const parts = message?.content || [];
  const text = parts
    .filter((part) => part?.type === 'output_text' && typeof part?.text === 'string')
    .map((part) => part.text)
    .join('')
    .trim();

  if (text) {
    return text;
  }

  return '';
}

async function getAccessToken() {
  // Temporary manual override for local debugging.
  const manualToken = getManualAccessToken();
  if (manualToken) {
    return manualToken;
  }

  if (shouldSkipEntraAuth()) {
    return null;
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
    .then((token) => {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return (
      fetch(url, {
        method: 'POST',
        headers,
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
      );
    })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
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
        const text = extractAssistantText(data);
        if (text) {
          onToken(text);
        }
      }

      onDone();
    })
    .catch((err) => {
      if (err.name === 'AbortError') return;
      onError(err);
    });
}
