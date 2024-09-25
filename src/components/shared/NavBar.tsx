import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { forwardRef, useEffect, useState, ReactNode } from 'react';

import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { useUserContext } from '@/context/UserContext';
import { NavbarProps, NavItemsProps } from '@/types';

interface NavItemProps {
  href: string;
  children: ReactNode;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, isActive }) => (
  <Link
    href={href}
    className={`px-2 py-1 text-sm font-medium ${
      isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'
    }`}
  >
    {children}
  </Link>
);
const NavItems: React.FC<NavItemsProps> = ({
  isAuthenticated,
  effectiveRole,
  pathname,
}) => {
  const homeItem = { path: '/', label: 'Home' };

  const commonItems = [
    { path: '/documents', label: 'Documents' },
    // { path: '/collections', label: 'Collections' },
    { path: '/chat', label: 'Chat' },
  ];

  const adminItems = [
    { path: '/users', label: 'Users' },
    { path: '/logs', label: 'Logs' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/settings', label: 'Settings' },
  ];

  const items =
    effectiveRole === 'admin'
      ? [homeItem, ...commonItems, ...adminItems]
      : [homeItem, ...commonItems];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav>
      <div className="flex items-center space-x-2">
        {items.map((item) => (
          <NavItem
            key={item.path}
            href={item.path}
            isActive={pathname === item.path}
          >
            {item.label}
          </NavItem>
        ))}
      </div>
    </nav>
  );
};

export const Navbar = forwardRef<React.ElementRef<'nav'>, NavbarProps>(
  function Header({ className }, ref) {
    const pathname = usePathname();
    const {
      logout,
      isAuthenticated,
      authState,
      viewMode,
      setViewMode,
      isSuperUser,
    } = useUserContext();
    const router = useRouter();
    const [isSignedIn, setIsSignedIn] = useState(false);

    useEffect(() => {
      setIsSignedIn(isAuthenticated);
    }, [isAuthenticated]);

    const isAdmin = isAuthenticated && authState.userRole === 'admin';
    const effectiveRole =
      viewMode === 'user' ? 'user' : authState.userRole || 'user';

    const handleLogout = async () => {
      await logout();
      router.push('/auth/login');
    };

    const isChatPage = router.pathname.includes('/chat');

    return (
      <nav
        ref={ref}
        className={`bg-zinc-900 shadow ${isChatPage ? '' : 'sticky'} z-50`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center space-x-4">
              <Link
                href={isSuperUser() ? '/' : '/documents'}
                className="flex-shrink-0 flex items-center"
              >
                <Logo className="h-12 w-auto" />
                <span className="ml-2 text-xl font-bold text-white">
                  SciPhi
                </span>
              </Link>
              {isSignedIn && (
                <>
                  <span className="text-zinc-400">|</span>
                  <NavItems
                    isAuthenticated={isAuthenticated}
                    effectiveRole={effectiveRole}
                    pathname={pathname}
                  />
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                color="primary"
                shape="outline_wide"
                onClick={() =>
                  window.open('https://r2r-docs.sciphi.ai', '_blank')
                }
              >
                Docs
              </Button>
              {isSignedIn && (
                <Button
                  onClick={handleLogout}
                  color="danger"
                  className="rounded-md py-1 px-3 w-30"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';
