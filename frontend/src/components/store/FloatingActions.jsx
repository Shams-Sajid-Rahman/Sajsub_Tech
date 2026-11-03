import BackToTop from '../ui/BackToTop.jsx';
import ChatAssistant from './ChatAssistant.jsx';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-[35px] right-[15px] z-40 flex flex-col items-center gap-[10px]">
      <BackToTop />
      <ChatAssistant />
    </div>
  );
}
