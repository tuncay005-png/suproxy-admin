/**
 * Admin Layout
 * 
 * Protected layout wrapper for all admin routes.
 * Provides consistent sidebar and header navigation across the admin dashboard.
 * 
 * ## Features
 * 
 * - Responsive layout with collapsible sidebar
 * - Persistent navigation across admin pages
 * - User menu and logout functionality
 * - Mobile-friendly sidebar toggle
 * 
 * ## Route Protection
 * 
 * This layout is protected by Next.js middleware (app/middleware.ts).
 * All routes under /admin/* require valid authentication.
 * 
 * Validates: Requirements 7.3, 7.4, 9.1, 12.1, 3.5, 7.6
 * 
 * @module app/admin/layout
 */

'use client';

import * as React from 'react';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';
import { AdminHeader } from '@/components/admin/layout/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Fixed on desktop, collapsible on mobile */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header with user menu and mobile menu toggle */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
