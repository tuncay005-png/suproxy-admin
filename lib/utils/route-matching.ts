/**
 * Route matching utilities for navigation active state
 * 
 * This module provides pure functions for determining whether a navigation
 * item should be highlighted as active based on the current pathname.
 * 
 * Validates: Requirements 3.19, 3.20, 3.21
 * 
 * @module lib/utils/route-matching
 */

import type { NavigationItem } from './navigation';

/**
 * Determines if a navigation item is active based on the current pathname
 * 
 * Logic:
 * - Exact match: /admin matches /admin
 * - Prefix match with trailing slash: /admin/users matches /admin/users/123
 * - Root route special case: /admin only matches exactly, not /admin/users
 * 
 * @param itemHref - The href of the navigation item (e.g., '/admin', '/admin/users')
 * @param pathname - The current pathname from usePathname()
 * @returns true if the navigation item should be highlighted as active
 * 
 * @example
 * ```ts
 * isActive('/admin', '/admin') // true
 * isActive('/admin', '/admin/users') // false (root route special case)
 * isActive('/admin/users', '/admin/users') // true
 * isActive('/admin/users', '/admin/users/123') // true
 * isActive('/admin/users', '/admin/sessions') // false
 * ```
 */
export function isActive(itemHref: string, pathname: string): boolean {
  // Exact match
  if (pathname === itemHref) {
    return true;
  }
  
  // Special case: root route /admin should NOT match child routes
  if (itemHref === '/admin') {
    return false;
  }
  
  // Prefix match with trailing slash
  return pathname.startsWith(`${itemHref}/`);
}

/**
 * Determines if a navigation item with children has any active child
 * 
 * @param item - The parent navigation item with children
 * @param pathname - The current pathname from usePathname()
 * @returns true if any child is active
 * 
 * @example
 * ```ts
 * const xrayItem = {
 *   labelKey: 'nav.xray_management',
 *   icon: Rocket,
 *   children: [
 *     { labelKey: 'nav.xray.inbounds', href: '/admin/xray/inbounds', icon: Download },
 *     // ...
 *   ]
 * };
 * 
 * hasActiveChild(xrayItem, '/admin/xray/inbounds') // true
 * hasActiveChild(xrayItem, '/admin/users') // false
 * ```
 */
export function hasActiveChild(item: NavigationItem, pathname: string): boolean {
  if (!item.children) {
    return false;
  }
  
  return item.children.some(
    (child) => child.href && isActive(child.href, pathname)
  );
}

/**
 * Gets all possible navigation routes from the navigation structure
 * 
 * This is useful for testing and generating route lists.
 * 
 * @param items - Array of navigation items (defaults to navigationItems)
 * @returns Array of all route paths
 * 
 * @example
 * ```ts
 * getAllRoutes() // ['/admin', '/admin/users', '/admin/xray/inbounds', ...]
 * ```
 */
export function getAllRoutes(items: NavigationItem[]): string[] {
  const routes: string[] = [];
  
  for (const item of items) {
    if (item.href) {
      routes.push(item.href);
    }
    
    if (item.children) {
      routes.push(...getAllRoutes(item.children));
    }
  }
  
  return routes;
}
