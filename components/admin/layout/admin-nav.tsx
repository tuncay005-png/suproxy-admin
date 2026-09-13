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
 * - i18n-ready with labelKey support (i18n integration in Task 1.2-3.4)
 * 
 * Validates: Requirements 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19
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
import { useTranslations } from '@/lib/i18n/context';
import { isActive, hasActiveChild } from '@/lib/utils/route-matching';

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
  const { t } = useTranslations();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Check if this item or any of its children are active
  const itemIsActive = item.href ? isActive(item.href, pathname) : false;
  const itemHasActiveChild = hasActiveChild(item, pathname);

  // Auto-expand if a child is active
  React.useEffect(() => {
    if (itemHasActiveChild) {
      setIsExpanded(true);
    }
  }, [itemHasActiveChild]);

  const Icon = item.icon;

  // Handle items with children (expandable submenu)
  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]',
            itemHasActiveChild
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="flex-1 text-left">{t(item.labelKey)}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1 flex flex-col gap-1 border-l pl-2">
            {item.children.map((child) => (
              <NavItem key={child.href || child.labelKey} item={child} onClick={onClick} />
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
          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground min-h-[44px]',
          'opacity-60 cursor-not-allowed'
        )}
        title={t('common.coming_soon')}
      >
        <Icon className="h-5 w-5" />
        <span className="flex items-center gap-2">
          {t(item.labelKey)}
          <span className="text-xs opacity-75">({t('common.coming_soon')})</span>
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
        'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]',
        itemIsActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{t(item.labelKey)}</span>
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
        <NavItem key={item.href || item.labelKey} item={item} onClick={onItemClick} />
      ))}
    </nav>
  );
}
