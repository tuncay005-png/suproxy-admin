/**
 * Admin Header Component
 * 
 * Top navigation bar for the admin dashboard.
 * 
 * ## Features
 * 
 * - User information display
 * - Logout functionality
 * - Mobile menu toggle
 * - Responsive design
 * 
 * ## User Menu
 * 
 * Displays the current user's name and email with a logout button.
 * Logout clears the session cookie and redirects to the login page.
 * 
 * Validates: Requirements 7.4, 2.4, 2.5, 9.1, 12.1, 3.5, 7.6
 * 
 * @module components/admin/layout/admin-header
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

export interface AdminHeaderProps {
  /**
   * Optional className for the header container
   */
  className?: string;
  /**
   * Callback for mobile menu button click
   */
  onMenuClick?: () => void;
}

/**
 * Admin header component
 * 
 * Provides user menu, logout functionality, and mobile menu toggle.
 * 
 * @example
 * ```tsx
 * <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />
 * ```
 */
export function AdminHeader({ className, onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  /**
   * Handle logout action
   * 
   * Calls the logout API endpoint to clear the session cookie,
   * then redirects to the login page.
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Call logout API to clear session cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Redirect to login page
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, redirect to login
      // The middleware will handle the redirect if needed
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-card',
        className
      )}
    >
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Spacer to push user menu to the right */}
        <div className="flex-1" />

        {/* User menu */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* User info - hidden on mobile, visible on desktop */}
          <div className="hidden text-right text-sm md:block">
            <p className="font-medium">Administrator</p>
            <p className="text-xs text-muted-foreground">admin@suproxy.com</p>
          </div>

          {/* Logout button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
