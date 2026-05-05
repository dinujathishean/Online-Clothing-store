import { Outlet } from 'react-router-dom';
import ShopHeader from '../components/layout/ShopHeader.jsx';
import ShopFooter from '../components/layout/ShopFooter.jsx';
import NewsletterSection from '../components/layout/NewsletterSection.jsx';

export default function ShopLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 antialiased">
      <ShopHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <NewsletterSection />
      <ShopFooter />
    </div>
  );
}
