import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiService, ChatMessage } from '../services/aiService';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  User
} from 'lucide-react';

interface AiAssistantPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: `Hello ${user?.username || ''}! I am your **Accessible Healthcare AI Assistant**.\n\nI can help you understand medical terms, explain your uploaded prescriptions, suggest relevant medical departments for symptoms, and help you prepare questions for your next doctor visit.\n\n*Note: I am designed for health literacy and cannot provide medical diagnoses or prescribe medications.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionSuggestions: [
        { label: '💊 What medicines are written in my prescription?', action: 'prompt:What medicines are written in my prescription?' },
        { label: '📋 Prepare questions for my doctor', action: 'prompt:Prepare questions for my doctor' },
        { label: '🏥 Recommend department for Bone Pain', action: 'prompt:I have bone pain and knee discomfort' }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUserPrompt, setLastUserPrompt] = useState('');
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    let mounted = true;

    const loadChatHistory = async () => {
      if (!user?.id) {
        if (mounted) setIsHistoryLoading(false);
        return;
      }

      setIsHistoryLoading(true);
      const history = await aiService.loadHistory(user.id);
      if (!mounted) return;

      if (history.length > 0) {
        setMessages(history);
      }
      setIsHistoryLoading(false);
    };

    loadChatHistory();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading || !user) return;

    setError('');
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setInputQuery('');
    setLastUserPrompt(textToSend.trim());
    setIsLoading(true);

    try {
      // Phase 3: the backend chat endpoint stores both the user and assistant
      // messages atomically. This avoids duplicate persistence and lets the
      // assistant use secure MySQL-backed profile/document/appointment context.
      setMessages(prev => [...prev, userMsg]);

      const response = await aiService.sendMessage(textToSend.trim(), user.id);
      setMessages(prev => [...prev, response]);
    } catch (err: any) {
      setError(err?.message || 'Unable to save or generate the AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.startsWith('prompt:')) {
      const query = action.replace('prompt:', '');
      handleSend(query);
    } else if (action.startsWith('navigate:')) {
      const target = action.replace('navigate:', '');
      if (target.includes('?')) {
        const [page] = target.split('?');
        onNavigate(page);
      } else {
        onNavigate(target);
      }
    }
  };

  const handleRetry = () => {
    if (lastUserPrompt) {
      handleSend(lastUserPrompt);
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-emerald">Clinical Knowledge AI</span>
          <span className="badge badge-neutral">Grounded in Uploaded Records</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>AI Healthcare Assistant</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Ask questions about medical terms, understand your prescriptions, and prepare questions for your doctor.
        </p>
      </div>

      {/* CHAT CONTAINER */}
      <div className="glass-card" style={{ height: '620px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat Header */}
        <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Health Assistant Active</div>
              <div style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Safety & Guardrail Checks Enabled
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Emergency? <button onClick={() => onNavigate('emergency')} style={{ background: 'none', border: 'none', color: '#f87171', fontWeight: '700', cursor: 'pointer' }}>Call 112</button>
          </div>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isHistoryLoading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading your saved health conversation...
            </div>
          )}

          {!isHistoryLoading && messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '10px'
                }}
              >
                {!isUser && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                    <Bot size={16} />
                  </div>
                )}

                <div style={{ maxWidth: '80%' }}>
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : msg.isEmergencyAlert
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: msg.isEmergencyAlert
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : isUser
                        ? 'none'
                        : '1px solid var(--border-glass)',
                      color: '#ffffff',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* Action Suggestions */}
                  {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                      {msg.actionSuggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleActionClick(sug.action)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '16px', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                        >
                          <Sparkles size={12} color="#38bdf8" /> {sug.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: isUser ? 'right' : 'left' }}>
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Bot size={16} />
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '14px', border: '1px solid var(--border-glass)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Evaluating verified clinical context & prescription records...
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              <button onClick={handleRetry} className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-glass)' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '14px' }}
              placeholder="Ask about prescriptions, medical terms, doctor visit questions..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
