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
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#fdfdfe] bg-[radial-gradient(150px_260px_at_0_230px,#c9defd,transparent),radial-gradient(170px_280px_at_100%_240px,#cfe2fe,transparent),linear-gradient(180deg,#e3edfd_135px,#f5f8fe_450px,#fdfdfe_780px)] bg-no-repeat font-sans">
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
