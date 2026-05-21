import { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { MessageCircle, X, Trash2, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

interface Message {
  role: 'user' | 'ai';
  text: string;
  time: Date;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "Hi! I'm your DevOps AI assistant. Ask me anything about CI/CD pipelines, Docker, Kubernetes, or paste a failing log and I'll help debug it.",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setOpen(true);
      const logContext = e.detail?.logContext;
      if (logContext) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: 'I have loaded the terminal log context. What would you like to know about it?',
            time: new Date(),
          },
        ]);
        setInput(`Debug this log:\n\n${logContext.substring(0, 500)}...`);
      }
    };

    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', text: trimmed, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatService.sendMessage(trimmed);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: data.response, time: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: '⚠️ Failed to reach AI service. Please check if the backend is running.',
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'ai',
        text: "Conversation cleared. How can I help you?",
        time: new Date(),
      },
    ]);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* FAB */}
      <button
        className={`chat-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        title="AI Assistant"
      >
        {open ? <X size={20} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-header-dot" />
              <span className="chat-header-title">DevOps AI Assistant</span>
            </div>
            <div className="chat-header-actions">
              <button
                className="chat-header-btn"
                onClick={handleClear}
                title="Clear conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${
                  msg.role === 'user' ? 'bubble-user' : 'bubble-ai'
                }`}
              >
                {msg.role === 'ai' && (
                  <span className="bubble-avatar">
                    <Bot size={16} color="var(--primary-hover)" />
                  </span>
                )}
                <div className="bubble-content">
                  <div className="bubble-text markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  <span className="bubble-time">{formatTime(msg.time)}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bubble-ai">
                <span className="bubble-avatar">
                  <Bot size={16} color="var(--primary-hover)" />
                </span>
                <div className="bubble-content">
                  <div className="bubble-text typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-footer">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Ask about CI/CD, Docker, logs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="chat-send"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send size={15} />
            </button>
          </div>

          <div className="chat-powered">Powered by AI DevOps Platform</div>
        </div>
      )}
    </>
  );
}
