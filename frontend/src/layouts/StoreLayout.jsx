import * as m from 'motion/react-m';
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from '../components/store/AnnouncementBar.jsx';
import FloatingActions from '../components/store/FloatingActions.jsx';
import Footer from '../components/store/Footer.jsx';
import Header from '../components/store/Header.jsx';
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx';
import { PageSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { DURATION, EASE } from '../utils/motion.js';

export default function StoreLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#fdfdfe] bg-[radial-gradient(150px_260px_at_0_230px,#c9defd,transparent),radial-gradient(170px_280px_at_100%_240px,#cfe2fe,transparent),linear-gradient(180deg,#e3edfd_135px,#f5f8fe_450px,#fdfdfe_780px)] bg-no-repeat font-sans">
      <AnnouncementBar />
      <Header />
      <div className="flex-1">
        {/* Inside the layout, so the header and footer stay put while a page loads. */}
        <ErrorBoundary resetKey={pathname}>
          <m.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DURATION.base, ease: EASE }}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </m.div>
        </ErrorBoundary>
      </div>
      <Footer />
      <FloatingActions />
    </div>
  );
}
