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

export function streamChat(messages, { onToken, onDone, onError, signal }) {
  const url = getApiUrl();

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  })
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
