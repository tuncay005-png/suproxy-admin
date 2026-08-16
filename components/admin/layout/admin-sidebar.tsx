/**
 * Admin Sidebar Component
 * 
 * Main navigation sidebar for the admin dashboard.
 * 
 * ## Features
 * 
 * - Fixed sidebar on desktop
 * - Responsive design with mobile drawer
 * - Logo and branding area
 * - Dynamic navigation items
 * - Consistent styling with shadcn/ui
 * 
 * ## Responsive Behavior
 * 
 * - **Mobile (< 768px)**: Drawer overlay that can be toggled
 * - **Desktop (≥ 768px)**: Fixed sidebar always visible
 * 
 * Validates: Requirements 7.3, 7.4, 9.1, 12.1, 3.5, 7.6
 * 
 * @module components/admin/layout/admin-sidebar
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminNav } from './admin-nav';
import { Button } from '@/components/ui/button';

export interface AdminSidebarProps {
  /**
   * Optional className for the sidebar container
   */
  className?: string;
  /**
   * Whether the mobile sidebar is open
   */
  isOpen?: boolean;
  /**
   * Callback to close the mobile sidebar
   */
  onClose?: () => void;
}

/**
 * Admin sidebar component
 * 
 * Provides the main navigation structure for the admin dashboard.
 * On mobile, displays as an overlay drawer. On desktop, displays as a fixed sidebar.
 * 
 * @example
 * ```tsx
 * <AdminSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
 * ```
 */
export function AdminSidebar({ className, isOpen = false, onClose }: AdminSidebarProps) {
  // Close sidebar on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sidebarContent = (
    <>
      {/* Logo and branding */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 font-semibold"
            onClick={onClose}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">S</span>
            </div>
            <span className="text-lg">Suproxy Admin</span>
          </Link>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <AdminNav onItemClick={onClose} />
      </div>

      {/* Footer section */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Admin Dashboard v0.1.0
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Mobile drawer + Desktop fixed */}
      <aside
        className={cn(
          // Mobile styles
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          // Desktop styles
          'md:flex md:flex-col',
          // Mobile open/closed state
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
