/**
 * Admin Navigation Component
 * 
 * Renders navigation items for the admin sidebar.
 * Supports active state highlighting, disabled items, and expandable submenus.
 * 
 * ## Features
 * 
 * - Dynamic navigation from configuration
 * - Active route highlighting
 * - Disabled state for unimplemented modules
 * - Icon support with lucide-react
 * - Expandable/collapsible submenus
 * 
 * Validates: Requirements 7.3, 9.1, 12.1, 12.2, 12.4, 3.5, 7.6
 * 
 * @module components/admin/layout/admin-nav
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { navigationItems, type NavigationItem } from '@/lib/utils/navigation';
import { cn } from '@/lib/utils';

export interface AdminNavProps {
  /**
   * Optional className for the nav container
   */
  className?: string;
  /**
   * Optional callback when a navigation item is clicked (useful for closing mobile menu)
   */
  onItemClick?: () => void;
}

/**
 * Renders a single navigation item
 */
function NavItem({ item, onClick }: { item: NavigationItem; onClick?: () => void }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Check if this item or any of its children are active
  const isActive = item.href ? (pathname === item.href || pathname.startsWith(`${item.href}/`)) : false;
  const hasActiveChild = item.children?.some(
    (child) => child.href && (pathname === child.href || pathname.startsWith(`${child.href}/`))
  ) ?? false;

  // Auto-expand if a child is active
  React.useEffect(() => {
    if (hasActiveChild) {
      setIsExpanded(true);
    }
  }, [hasActiveChild]);

  const Icon = item.icon;

  // Handle items with children (expandable submenu)
  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            hasActiveChild
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="flex-1 text-left">{item.title}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1 flex flex-col gap-1 border-l pl-2">
            {item.children.map((child) => (
              <NavItem key={child.href || child.title} item={child} onClick={onClick} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Handle disabled items
  if (item.disabled) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground',
          'opacity-60 cursor-not-allowed'
        )}
        title="Coming soon"
      >
        <Icon className="h-5 w-5" />
        <span className="flex items-center gap-2">
          {item.title}
          <span className="text-xs opacity-75">(Coming Soon)</span>
        </span>
      </div>
    );
  }

  // Handle regular navigation items
  if (!item.href) {
    return null;
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{item.title}</span>
    </Link>
  );
}

/**
 * Admin navigation component
 * 
 * Renders all navigation items from the configuration.
 * 
 * @example
 * ```tsx
 * <AdminNav onItemClick={() => closeMobileMenu()} />
 * ```
 */
export function AdminNav({ className, onItemClick }: AdminNavProps) {
  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {navigationItems.map((item) => (
        <NavItem key={item.href || item.title} item={item} onClick={onItemClick} />
      ))}
    </nav>
  );
}
