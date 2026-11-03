import { Bot, ImageOff, MessageSquare, RotateCcw, Send, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore.js';
import { apiDelete, apiGet, apiPost } from '../../services/api.js';
import { formatMoney } from '../../utils/format.js';
import { DURATION, EASE, pressable } from '../../utils/motion.js';

const STORAGE_KEY = 'sajsub-chat-id';
const MAX_MESSAGE_LENGTH = 1000;
const WELCOME = "Hi! I'm the Sajsub Tech shopping assistant. Ask me about prices, stock or which product suits you. Prices and stock come straight from our store.";
const SUGGESTIONS = [
  'What is the price of MacBook Air M2?',
  'Is iPhone 16 available?',
  'Show Sony headphones',
  'Which products are on sale?',
  'Recommend a laptop for programming',
];

// The saved chat id is only a convenience, so a blocked browser store just means a fresh chat.
const readChatId = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
const writeChatId = (id) => {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do: the chat still works for this visit.
  }
};

function ProductResult({ product, onNavigate }) {
  return (
    <li>
      <Link to={`/product/${product.slug}`} onClick={onNavigate} className="flex items-center gap-3 rounded-lg border border-line bg-white p-2 transition hover:border-primary">
        <span className="flex size-14 shrink-0 items-center justify-center rounded bg-page">
          {product.primaryImage ? (
            <img src={product.primaryImage.url} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
          ) : (
            <ImageOff aria-hidden="true" className="size-5 text-slate-300" />
          )}
        </span>
        <span className="min-w-0 flex-1 text-xs">
          <span className="block truncate font-semibold text-navy">{product.name}</span>
          <span className="mt-0.5 block text-sm font-bold tabular-nums text-navy">
            {formatMoney(product.effectivePrice)}
            {product.discountPrice && <span className="ml-1.5 text-xs font-normal text-muted line-through">{formatMoney(product.price)}</span>}
          </span>
          <span className={`block font-medium ${product.inStock ? 'text-green-700' : 'text-red-700'}`}>
            {product.inStock ? 'In stock' : 'Out of stock'}
          </span>
        </span>
      </Link>
    </li>
  );
}

function ChatMessage({ message, onNavigate }) {
  const isCustomer = message.role === 'user';
  return (
    <m.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DURATION.base, ease: EASE }} className={`flex flex-col gap-2 ${isCustomer ? 'items-end' : 'items-start'}`}>
      <p className={`max-w-[85%] whitespace-pre-line break-words rounded-2xl px-3 py-2 text-sm ${isCustomer ? 'rounded-br-sm bg-primary text-white' : 'rounded-bl-sm bg-page text-navy'}`}>
        {message.content}
      </p>
      {message.products?.length > 0 && (
        <ul aria-label="Products" className="w-full space-y-2">
          {message.products.map((product) => (
            <ProductResult key={product.slug} product={product} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </m.li>
  );
}

function TypingIndicator() {
  return (
    <li role="status" aria-label="The assistant is typing" className="flex w-fit gap-1 rounded-2xl rounded-bl-sm bg-page px-3 py-3">
      {[0, 150, 300].map((delay) => (
        <span key={delay} aria-hidden="true" style={{ animationDelay: `${delay}ms` }} className="size-1.5 animate-bounce rounded-full bg-muted motion-reduce:animate-none" />
      ))}
    </li>
  );
}

export default function ChatAssistant() {
  const { site, siteLoaded } = useStore();
  const enabled = Boolean(site.assistant?.enabled);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const conversationId = useRef(null);
  const historyLoaded = useRef(false);
  const listEnd = useRef(null);
  const input = useRef(null);

  // Reopens the visitor's last chat. If it's gone or belongs to another login, a new one starts.
  useEffect(() => {
    if (!open || !enabled || historyLoaded.current) return;
    historyLoaded.current = true;
    const savedId = readChatId();
    if (!savedId) return;
    apiGet(`/ai/conversations/${savedId}`)
      .then(({ data }) => {
        conversationId.current = data.id;
        setMessages(data.messages);
      })
      .catch(() => writeChatId(null));
  }, [open, enabled]);

  useEffect(() => {
    if (open) listEnd.current?.scrollIntoView?.({ block: 'end' });
  }, [open, messages, sending, error]);

  useEffect(() => {
    if (open && enabled) input.current?.focus();
  }, [open, enabled]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = ({ key }) => {
      if (key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const send = async (text) => {
    const message = text.trim();
    if (!message || sending) return;
    setDraft('');
    setError(null);
    setSending(true);
    setMessages((current) => [...current, { id: `local-${Date.now()}`, role: 'user', content: message }]);
    try {
      const { data } = await apiPost('/ai/messages', { message, ...(conversationId.current && { conversationId: conversationId.current }) });
      conversationId.current = data.conversationId;
      writeChatId(data.conversationId);
      // The server removes personal details, so the customer sees what was actually sent.
      setMessages((current) => [
        ...current.slice(0, -1),
        { ...current.at(-1), content: data.message },
        { id: `reply-${Date.now()}`, role: 'assistant', content: data.reply, products: data.products },
      ]);
    } catch (requestError) {
      // The failed message comes off the list, because Try again sends it a second time.
      setMessages((current) => current.slice(0, -1));
      setError({ message: requestError.message, retry: message });
    } finally {
      setSending(false);
      input.current?.focus();
    }
  };

  const startNewChat = async () => {
    const previous = conversationId.current;
    conversationId.current = null;
    writeChatId(null);
    setMessages([]);
    setError(null);
    if (previous) await apiDelete(`/ai/conversations/${previous}`).catch(() => {});
  };

  const closeOnSmallScreens = () => {
    if (window.matchMedia('(max-width: 639px)').matches) setOpen(false);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    send(draft);
  };

  return (
    <>
      <AnimatePresence>
      {open && (
        <m.section
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: DURATION.base, ease: EASE }}
          aria-label="Shopping assistant"
          className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-[100px] sm:right-[15px] sm:h-[560px] sm:max-h-[calc(100vh-120px)] sm:w-[380px] sm:rounded-2xl sm:border sm:border-line sm:shadow-xl"
        >
          <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="flex items-center gap-2 font-semibold text-navy">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-white">
                <Bot aria-hidden="true" className="size-4" />
              </span>
              Shopping assistant
            </h2>
            <span className="flex items-center gap-1">
              {messages.length > 0 && (
                <button type="button" onClick={startNewChat} aria-label="Start a new chat" title="Start a new chat" className="rounded p-1.5 text-muted hover:text-navy">
                  <RotateCcw aria-hidden="true" className="size-4" />
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded p-1.5 text-muted hover:text-navy">
                <X aria-hidden="true" className="size-5" />
              </button>
            </span>
          </header>

          {!enabled && (
            <p className="p-4 text-sm text-muted">{siteLoaded ? "Our AI assistant isn't available yet. Please browse the shop or contact us." : 'Loading...'}</p>
          )}

          {enabled && (
            <>
              <ul aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4">
                <ChatMessage message={{ role: 'assistant', content: WELCOME }} onNavigate={closeOnSmallScreens} />
                {messages.length === 0 && !sending && (
                  <li>
                    <p className="mb-2 text-xs font-medium text-muted">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((suggestion) => (
                        <button key={suggestion} type="button" onClick={() => send(suggestion)} className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-xs font-medium text-navy hover:border-primary hover:text-primary">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </li>
                )}
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} onNavigate={closeOnSmallScreens} />
                ))}
                {sending && <TypingIndicator />}
                {error && (
                  <li role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error.message}
                    <button type="button" onClick={() => send(error.retry)} className="mt-1 block font-semibold underline">
                      Try again
                    </button>
                  </li>
                )}
                <li ref={listEnd} aria-hidden="true" />
              </ul>

              <form onSubmit={onSubmit} className="border-t border-line p-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={input}
                    type="text"
                    aria-label="Your message"
                    placeholder="Ask about a product..."
                    autoComplete="off"
                    maxLength={MAX_MESSAGE_LENGTH}
                    value={draft}
                    onChange={({ target }) => setDraft(target.value)}
                    className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-2 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <button type="submit" aria-label="Send" disabled={sending || !draft.trim()} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                    <Send aria-hidden="true" className="size-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] leading-tight text-muted">
                  AI can make mistakes, so check the product page before you buy. Please don't share personal details: chats are processed by Google and may be reviewed.
                </p>
              </form>
            </>
          )}
        </m.section>
      )}
      </AnimatePresence>
      <m.button
        {...pressable}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? 'Close shopping assistant' : 'Open shopping assistant'}
        className="flex size-[50px] items-center justify-center rounded-full bg-primary text-white shadow-glow hover:bg-primary-dark"
      >
        {open ? <X aria-hidden="true" className="size-[22px]" /> : <MessageSquare aria-hidden="true" className="size-[22px] fill-white" />}
      </m.button>
    </>
  );
}
