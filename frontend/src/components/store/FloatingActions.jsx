import { ArrowUp } from 'lucide-react';
import ChatAssistant from './ChatAssistant.jsx';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-[35px] right-[15px] z-40 flex flex-col items-center gap-[10px]">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className="flex size-[41px] items-center justify-center rounded-full border border-line bg-white/90 text-navy shadow-sm hover:text-primary"
      >
        <ArrowUp aria-hidden="true" className="size-[18px]" />
      </button>
      <ChatAssistant />
    </div>
  );
}
