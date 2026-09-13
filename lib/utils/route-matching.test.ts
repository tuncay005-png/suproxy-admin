/**
 * Property-Based Tests for Active Route Highlighting
 * 
 * Task 3.7: Write property test for active route highlighting
 * 
 * **Property 7: Active Route Highlighting**
 * **Validates: Requirements 3.21**
 * 
 * This test suite validates that the isActive() function correctly identifies
 * which navigation items should be highlighted based on the current route.
 * 
 * Test Coverage:
 * - Exact route matches
 * - Child route prefix matches
 * - Root route special case (/admin)
 * - Non-matching routes
 * - Nested submenu routes
 * - Similar route prefixes
 * 
 * @module lib/utils/route-matching.test
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isActive, hasActiveChild, getAllRoutes } from './route-matching';
import { navigationItems } from './navigation';

describe('Property 7: Active Route Highlighting', () => {
  // Define all valid navigation routes from the spec
  const validRoutes = [
    '/admin',
    '/admin/users',
    '/admin/sessions',
    '/admin/xray/inbounds',
    '/admin/xray/clients',
    '/admin/xray/nodes',
    '/admin/xray/routing',
    '/admin/plans',
    '/admin/logs',
    '/admin/monitoring',
  ];

  describe('isActive() - Exact Route Matching', () => {
    it('should return true for exact route matches', () => {
      fc.assert(
        fc.property(fc.constantFrom(...validRoutes), (route) => {
          expect(isActive(route, route)).toBe(true);
        })
      );
    });

    it('should return false when pathname does not match itemHref', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validRoutes),
          fc.constantFrom(...validRoutes),
          (itemHref, pathname) => {
            // Only test when routes are different and not parent-child
            if (itemHref === pathname) return true; // Skip same route
            if (pathname.startsWith(`${itemHref}/`)) return true; // Skip child routes
            if (itemHref.startsWith(`${pathname}/`)) return true; // Skip parent routes
            
            expect(isActive(itemHref, pathname)).toBe(false);
          }
        )
      );
    });
  });

  describe('isActive() - Root Route Special Case', () => {
    it('should return true ONLY for exact /admin match, not child routes', () => {
      const rootRoute = '/admin';
      const childRoutes = [
        '/admin/users',
        '/admin/sessions',
        '/admin/xray/inbounds',
        '/admin/plans',
        '/admin/logs',
        '/admin/monitoring',
      ];

      // Exact match should be true
      expect(isActive(rootRoute, rootRoute)).toBe(true);

      // All child routes should be false
      childRoutes.forEach((childRoute) => {
        expect(isActive(rootRoute, childRoute)).toBe(false);
      });
    });

    it('should handle /admin vs /admin/ correctly', () => {
      expect(isActive('/admin', '/admin')).toBe(true);
      expect(isActive('/admin', '/admin/')).toBe(false);
    });
  });

  describe('isActive() - Child Route Prefix Matching', () => {
    it('should return true for child routes with prefix match', () => {
      const testCases = [
        { parent: '/admin/users', child: '/admin/users/123' },
        { parent: '/admin/users', child: '/admin/users/123/edit' },
        { parent: '/admin/xray/inbounds', child: '/admin/xray/inbounds/create' },
        { parent: '/admin/xray/clients', child: '/admin/xray/clients/abc-123' },
        { parent: '/admin/plans', child: '/admin/plans/new' },
        { parent: '/admin/plans', child: '/admin/plans/plan-123/edit' },
      ];

      testCases.forEach(({ parent, child }) => {
        expect(isActive(parent, child)).toBe(true);
      });
    });

    it('should not match routes with similar prefixes but different paths', () => {
      const testCases = [
        { itemHref: '/admin/user', pathname: '/admin/users' }, // 'user' vs 'users'
        { itemHref: '/admin/log', pathname: '/admin/logs' }, // 'log' vs 'logs'
        { itemHref: '/admin/plan', pathname: '/admin/plans' }, // 'plan' vs 'plans'
      ];

      testCases.forEach(({ itemHref, pathname }) => {
        expect(isActive(itemHref, pathname)).toBe(false);
      });
    });
  });

  describe('isActive() - Nested Submenu Routes', () => {
    it('should correctly identify active state for nested Xray routes', () => {
      const xrayRoutes = [
        '/admin/xray/inbounds',
        '/admin/xray/clients',
        '/admin/xray/nodes',
        '/admin/xray/routing',
      ];

      xrayRoutes.forEach((route) => {
        // Exact match should be true
        expect(isActive(route, route)).toBe(true);

        // Child routes should be true
        expect(isActive(route, `${route}/123`)).toBe(true);
        expect(isActive(route, `${route}/new`)).toBe(true);

        // Other Xray routes should be false
        xrayRoutes
          .filter((other) => other !== route)
          .forEach((otherRoute) => {
            expect(isActive(route, otherRoute)).toBe(false);
          });
      });
    });
  });

  describe('hasActiveChild() - Parent Menu Activation', () => {
    it('should return true when any child route is active', () => {
      const xrayParent = navigationItems.find(
        (item) => item.labelKey === 'nav.xray_management'
      );

      if (!xrayParent) {
        throw new Error('Xray Management parent item not found in navigation');
      }

      const xrayChildRoutes = [
        '/admin/xray/inbounds',
        '/admin/xray/clients',
        '/admin/xray/nodes',
        '/admin/xray/routing',
      ];

      xrayChildRoutes.forEach((route) => {
        expect(hasActiveChild(xrayParent, route)).toBe(true);
      });

      // Nested child routes should also activate parent
      expect(hasActiveChild(xrayParent, '/admin/xray/inbounds/123')).toBe(true);
      expect(hasActiveChild(xrayParent, '/admin/xray/clients/new')).toBe(true);
    });

    it('should return false when no child route is active', () => {
      const xrayParent = navigationItems.find(
        (item) => item.labelKey === 'nav.xray_management'
      );

      if (!xrayParent) {
        throw new Error('Xray Management parent item not found in navigation');
      }

      const nonXrayRoutes = [
        '/admin',
        '/admin/users',
        '/admin/sessions',
        '/admin/plans',
        '/admin/logs',
        '/admin/monitoring',
      ];

      nonXrayRoutes.forEach((route) => {
        expect(hasActiveChild(xrayParent, route)).toBe(false);
      });
    });

    it('should return false for items without children', () => {
      const usersItem = navigationItems.find(
        (item) => item.labelKey === 'nav.users'
      );

      if (!usersItem) {
        throw new Error('Users item not found in navigation');
      }

      expect(hasActiveChild(usersItem, '/admin/users')).toBe(false);
      expect(hasActiveChild(usersItem, '/admin/xray/inbounds')).toBe(false);
    });
  });

  describe('getAllRoutes() - Route Extraction', () => {
    it('should extract all routes from navigation structure', () => {
      const allRoutes = getAllRoutes(navigationItems);

      expect(allRoutes).toContain('/admin');
      expect(allRoutes).toContain('/admin/users');
      expect(allRoutes).toContain('/admin/sessions');
      expect(allRoutes).toContain('/admin/xray/inbounds');
      expect(allRoutes).toContain('/admin/xray/clients');
      expect(allRoutes).toContain('/admin/xray/nodes');
      expect(allRoutes).toContain('/admin/xray/routing');
      expect(allRoutes).toContain('/admin/plans');
      expect(allRoutes).toContain('/admin/logs');
      expect(allRoutes).toContain('/admin/monitoring');
    });

    it('should not include duplicate routes', () => {
      const allRoutes = getAllRoutes(navigationItems);
      const uniqueRoutes = [...new Set(allRoutes)];

      expect(allRoutes).toHaveLength(uniqueRoutes.length);
    });
  });

  describe('Property-Based Test: Route Matching Consistency', () => {
    it('should be consistent: if A is active for B, then A should match B or be a prefix of B', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validRoutes),
          fc.constantFrom(...validRoutes),
          (itemHref, pathname) => {
            const active = isActive(itemHref, pathname);

            if (active) {
              // If active, pathname must equal itemHref OR start with itemHref + '/'
              const matches =
                pathname === itemHref || pathname.startsWith(`${itemHref}/`);
              expect(matches).toBe(true);
            }
          }
        )
      );
    });

    it('should be transitive for nested routes: if /a/b/c is active for /a/b, then /a should also match the parent check', () => {
      const nestedRoutes = [
        { parent: '/admin', child: '/admin/users', grandchild: '/admin/users/123' },
        {
          parent: '/admin/xray/inbounds',
          child: '/admin/xray/inbounds/new',
          grandchild: '/admin/xray/inbounds/new/step-2',
        },
      ];

      nestedRoutes.forEach(({ parent, child, grandchild }) => {
        // Child should activate for grandchild
        expect(isActive(child, grandchild)).toBe(true);

        // Parent should activate for child (except root /admin case)
        if (parent !== '/admin') {
          expect(isActive(parent, child)).toBe(true);
          expect(isActive(parent, grandchild)).toBe(true);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle routes with trailing slashes', () => {
      // In Next.js, /admin/users/ would be normalized to /admin/users
      // But if a trailing slash exists, it's treated as a child path
      // /admin/users/ starts with '/admin/users/' so prefix match succeeds
      expect(isActive('/admin/users', '/admin/users/')).toBe(true);
      expect(isActive('/admin/users/', '/admin/users')).toBe(false);
    });

    it('should handle empty pathname', () => {
      expect(isActive('/admin', '')).toBe(false);
      expect(isActive('', '')).toBe(true);
    });

    it('should handle routes with query parameters', () => {
      expect(isActive('/admin/users', '/admin/users?page=1')).toBe(false);
      expect(isActive('/admin/users', '/admin/users/123?edit=true')).toBe(true);
    });

    it('should handle routes with hash fragments', () => {
      expect(isActive('/admin/users', '/admin/users#section')).toBe(false);
      expect(isActive('/admin/users', '/admin/users/123#top')).toBe(true);
    });

    it('should be case-sensitive', () => {
      expect(isActive('/admin/users', '/Admin/Users')).toBe(false);
      expect(isActive('/admin/Users', '/admin/users')).toBe(false);
    });
  });

  describe('Real-World Navigation Scenarios', () => {
    it('should correctly identify active item for all navigation routes', () => {
      const scenarios = [
        {
          pathname: '/admin',
          activeItems: ['/admin'],
          inactiveItems: [
            '/admin/users',
            '/admin/sessions',
            '/admin/xray/inbounds',
            '/admin/plans',
          ],
        },
        {
          pathname: '/admin/users',
          activeItems: ['/admin/users'],
          inactiveItems: ['/admin', '/admin/sessions', '/admin/xray/inbounds'],
        },
        {
          pathname: '/admin/users/123',
          activeItems: ['/admin/users'],
          inactiveItems: ['/admin', '/admin/sessions', '/admin/xray/inbounds'],
        },
        {
          pathname: '/admin/xray/inbounds',
          activeItems: ['/admin/xray/inbounds'],
          inactiveItems: [
            '/admin',
            '/admin/users',
            '/admin/xray/clients',
            '/admin/xray/nodes',
          ],
        },
        {
          pathname: '/admin/xray/inbounds/new',
          activeItems: ['/admin/xray/inbounds'],
          inactiveItems: ['/admin', '/admin/users', '/admin/xray/clients'],
        },
      ];

      scenarios.forEach(({ pathname, activeItems, inactiveItems }) => {
        activeItems.forEach((item) => {
          expect(isActive(item, pathname)).toBe(true);
        });

        inactiveItems.forEach((item) => {
          expect(isActive(item, pathname)).toBe(false);
        });
      });
    });

    it('should correctly identify parent menu activation for submenu navigation', () => {
      const xrayParent = navigationItems.find(
        (item) => item.labelKey === 'nav.xray_management'
      );

      if (!xrayParent) {
        throw new Error('Xray Management parent not found');
      }

      const scenarios = [
        { pathname: '/admin/xray/inbounds', shouldActivate: true },
        { pathname: '/admin/xray/inbounds/123', shouldActivate: true },
        { pathname: '/admin/xray/clients', shouldActivate: true },
        { pathname: '/admin/xray/nodes/new', shouldActivate: true },
        { pathname: '/admin/xray/routing', shouldActivate: true },
        { pathname: '/admin/users', shouldActivate: false },
        { pathname: '/admin', shouldActivate: false },
        { pathname: '/admin/plans', shouldActivate: false },
      ];

      scenarios.forEach(({ pathname, shouldActivate }) => {
        expect(hasActiveChild(xrayParent, pathname)).toBe(shouldActivate);
      });
    });
  });
});
