import { useCallback, useRef, useState } from 'react';
import { streamChat } from '../api/chat';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSend = useCallback(
    (text) => {
      const userMsg = { role: 'user', content: text };
      const assistantMsg = { role: 'assistant', content: '' };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const allMessages = [...messages, userMsg];

      streamChat(allMessages, {
        signal: controller.signal,
        onToken: (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + token,
            };
            return updated;
          });
          scrollToBottom();
        },
        onDone: () => {
          setIsStreaming(false);
          abortRef.current = null;
          scrollToBottom();
        },
        onError: (err) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: `⚠️ Error: ${err.message}`,
            };
            return updated;
          });
          setIsStreaming(false);
          abortRef.current = null;
        },
      });
    },
    [messages, scrollToBottom],
  );

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">Send a message to start chatting.</div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
