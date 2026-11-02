import { ArrowUp, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';

export default function FloatingActions() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="fixed bottom-[35px] right-[15px] z-40 flex flex-col items-center gap-[10px]">
      {chatOpen && (
        <section aria-label="Shopping assistant" className="absolute bottom-[60px] right-0 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-navy">Shopping assistant</h2>
            <button type="button" onClick={() => setChatOpen(false)} aria-label="Close assistant" className="text-muted hover:text-navy">
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">Our AI assistant isn't available yet. It's coming soon.</p>
        </section>
      )}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className="flex size-[41px] items-center justify-center rounded-full border border-line bg-white/90 text-navy shadow-sm hover:text-primary"
      >
        <ArrowUp aria-hidden="true" className="size-[18px]" />
      </button>
      <button
        type="button"
        onClick={() => setChatOpen((open) => !open)}
        aria-expanded={chatOpen}
        aria-label="Open shopping assistant"
        className="flex size-[50px] items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark"
      >
        <MessageSquare aria-hidden="true" className="size-[22px] fill-white" />
      </button>
    </div>
  );
}
