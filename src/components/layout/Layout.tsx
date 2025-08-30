import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import MobileNav from '../navigation/MobileNav';
import WebNav from '../navigation/WebNav';

interface LayoutProps {
  children: ReactNode;
  userVerified?: boolean;
  onSearch?: (query: string) => void;
}

export default function Layout({ children, userVerified = false, onSearch }: LayoutProps) {
  const router = useRouter();

  // Don't show navigation on certain pages
  const hideNavigation = ['/verify', '/admin'].some(path => 
    router.pathname.startsWith(path)
  );

  if (hideNavigation) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Web Navigation */}
      <WebNav userVerified={userVerified} onSearch={onSearch} />
      
      {/* Main Content */}
      <main className="pb-24 md:pb-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav userVerified={userVerified} />
    </div>
  );
}