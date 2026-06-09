/**
 * components/AiInsights.jsx
 * --------------------------------------------------------------
 * AI panel for the dashboard. Two parts:
 *
 *   1. Auto-generated insight cards (GET /api/ai/insights)
 *   2. A chat box where the user asks free-form questions about their
 *      own spending (POST /api/ai/chat)
 *
 * Degrades gracefully:
 *   - On mount it calls /api/ai/status. If the server has no
 *     OPENAI_API_KEY, it shows a tasteful "coming soon / not configured"
 *     state instead of erroring.
 *   - Network / rate-limit errors surface as inline messages, never a
 *     blank crash.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, Bot, User, RefreshCw } from 'lucide-react';
import { aiApi } from '../api/endpoints';

const TONE_RING = {
  positive: 'border-mint-200 dark:border-mint-800/50',
  neutral: 'border-iris-200 dark:border-iris-800/50',
  warning: 'border-amber-200 dark:border-amber-800/50',
  danger: 'border-coral-200 dark:border-coral-800/50',
};

const STARTER_QUESTIONS = [
  'Where is most of my money going?',
  'How can I save more this month?',
  'Am I over budget anywhere?',
  'What changed since last month?',
];

export default function AiInsights() {
  const [status, setStatus] = useState('checking'); // checking | ready | unconfigured | error
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState('');

  const scrollRef = useRef(null);

  // 1) Check whether AI is configured, then load insights.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await aiApi.status();
        if (cancelled) return;
        if (!data.configured) {
          setStatus('unconfigured');
          setInsightsLoading(false);
          return;
        }
        setStatus('ready');
        await loadInsights();
      } catch {
        if (!cancelled) {
          setStatus('error');
          setInsightsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const { data } = await aiApi.insights();
      setInsights(data.insights || []);
      if (data.configured === false) setStatus('unconfigured');
    } catch {
      setInsights([]);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Auto-scroll the chat to the newest message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || sending) return;

    setChatError('');
    const history = messages.slice(-6);
    const next = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      const { data } = await aiApi.chat(question, history);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Something went wrong talking to the AI. Please try again.';
      setChatError(msg);
      // roll back the optimistic user message? No — keep it, just show error.
    } finally {
      setSending(false);
    }
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className="glass-card overflow-hidden !p-0">
      {/* Header — brand gradient band */}
      <div className="flex items-center justify-between bg-gradient-brand px-5 py-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold leading-tight">FinanceFlow AI</h3>
            <p className="text-xs text-white/80">Insights from your own data</p>
          </div>
        </div>
        {status === 'ready' && (
          <button
            onClick={loadInsights}
            disabled={insightsLoading}
            className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-50"
            title="Refresh insights"
            aria-label="Refresh insights"
          >
            <RefreshCw className={`h-4 w-4 ${insightsLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="p-5">
        {/* Not configured */}
        {status === 'unconfigured' && (
          <div className="rounded-2xl border border-iris-200 bg-iris-50/60 p-4 text-sm dark:border-iris-800/50 dark:bg-iris-950/30">
            <div className="mb-1 flex items-center gap-2 font-semibold text-iris-700 dark:text-iris-300">
              <Bot className="h-4 w-4" /> AI is almost ready
            </div>
            <p className="text-ink-600 dark:text-ink-300">
              Add an <code className="rounded bg-ink-100 px-1 dark:bg-ink-800">OPENAI_API_KEY</code>{' '}
              on the server to switch this on. Your rule-based insights keep working in the meantime.
            </p>
          </div>
        )}

        {status === 'error' && (
          <p className="text-sm text-coral-600 dark:text-coral-400">
            Couldn't reach the AI service. It may be waking up — try refreshing in a moment.
          </p>
        )}

        {/* Insight cards */}
        {status === 'ready' && (
          <div className="space-y-2.5">
            {insightsLoading ? (
              <>
                <div className="skeleton h-12 w-full rounded-2xl" />
                <div className="skeleton h-12 w-full rounded-2xl" />
                <div className="skeleton h-12 w-3/4 rounded-2xl" />
              </>
            ) : (
              <AnimatePresence>
                {insights.map((ins, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex gap-3 rounded-2xl border bg-white/60 p-3 dark:bg-ink-900/40 ${
                      TONE_RING[ins.tone] || TONE_RING.neutral
                    }`}
                  >
                    <span className="text-xl leading-none">{ins.icon || '✨'}</span>
                    <div className="min-w-0">
                      {ins.title && (
                        <div className="text-sm font-semibold">{ins.title}</div>
                      )}
                      <div className="text-sm text-ink-600 dark:text-ink-300">
                        {ins.message}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Chat — only when AI is live */}
        {status === 'ready' && (
          <div className="mt-5 border-t border-ink-100 pt-4 dark:border-ink-800">
            {/* Messages */}
            {messages.length > 0 && (
              <div
                ref={scrollRef}
                className="mb-3 max-h-72 space-y-3 overflow-y-auto pr-1"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${
                      m.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-white ${
                        m.role === 'user'
                          ? 'bg-ink-700 dark:bg-ink-600'
                          : 'bg-gradient-brand'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                        m.role === 'user'
                          ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900'
                          : 'bg-iris-50 text-ink-800 dark:bg-iris-950/40 dark:text-ink-100'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex items-center gap-2 text-sm text-ink-400">
                    <Sparkles className="h-3.5 w-3.5 animate-sparkle" />
                    Thinking…
                  </div>
                )}
              </div>
            )}

            {/* Starter chips (only before any conversation) */}
            {messages.length === 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={sending}
                    className="rounded-full border border-ink-200 bg-white/60 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-iris-300 hover:text-iris-600 disabled:opacity-50 dark:border-ink-700 dark:bg-ink-900/40 dark:text-ink-300 dark:hover:border-iris-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {chatError && (
              <p className="mb-2 text-xs text-coral-600 dark:text-coral-400">{chatError}</p>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your spending…"
                maxLength={500}
                disabled={sending}
                className="input !py-2.5"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow transition hover:shadow-glow-lg disabled:opacity-50"
                aria-label="Send"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
