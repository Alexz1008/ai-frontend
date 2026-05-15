import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessage({ role, content, isLoading = false }) {
  const isUser = role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-bubble">
        {isUser ? (
          content
        ) : isLoading ? (
          <div className="typing-indicator" aria-label="Assistant is typing">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
