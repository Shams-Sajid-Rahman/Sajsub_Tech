import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FloatingActions from '../components/store/FloatingActions.jsx';
import SiteFooter from '../components/store/SiteFooter.jsx';
import SiteHeader from '../components/store/SiteHeader.jsx';
import TopBar from '../components/store/TopBar.jsx';

export default function StoreLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#f5f8fe] bg-[radial-gradient(circle_at_0%_100%,#dce8fb_0,transparent_240px),linear-gradient(135deg,#eaf1fd_0,transparent_420px)] font-sans">
      <TopBar />
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
      <FloatingActions />
    </div>
  );
}
