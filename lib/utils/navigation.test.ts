import { describe, it, expect } from 'vitest';
import { navigationItems } from './navigation';
import {
  BarChart3,
  Users,
  FileText,
  Rocket,
  Download,
  Key,
  Settings,
  Map,
  Package,
  Monitor,
} from 'lucide-react';

describe('navigation configuration', () => {
  describe('navigationItems array', () => {
    it('should contain exactly 7 navigation items', () => {
      expect(navigationItems).toHaveLength(7);
    });

    it('should have Dashboard as the first item', () => {
      const dashboard = navigationItems[0];
      expect(dashboard.labelKey).toBe('nav.dashboard');
      expect(dashboard.href).toBe('/admin');
      expect(dashboard.icon).toBe(BarChart3);
      expect(dashboard.disabled).toBeUndefined();
    });

    it('should have Users as the second item', () => {
      const users = navigationItems[1];
      expect(users.labelKey).toBe('nav.users');
      expect(users.href).toBe('/admin/users');
      expect(users.icon).toBe(Users);
      expect(users.disabled).toBeUndefined();
    });

    it('should have Sessions as the third item', () => {
      const sessions = navigationItems[2];
      expect(sessions.labelKey).toBe('nav.sessions');
      expect(sessions.href).toBe('/admin/sessions');
      expect(sessions.icon).toBe(FileText);
      expect(sessions.disabled).toBeUndefined();
    });

    it('should have Xray Management section with children', () => {
      const xray = navigationItems[3];
      expect(xray.labelKey).toBe('nav.xray_management');
      expect(xray.icon).toBe(Rocket);
      expect(xray.href).toBeUndefined();
      expect(xray.children).toBeDefined();
      expect(xray.children).toHaveLength(4);
      
      // Check Xray children
      expect(xray.children![0].labelKey).toBe('nav.xray.inbounds');
      expect(xray.children![0].href).toBe('/admin/xray/inbounds');
      expect(xray.children![0].icon).toBe(Download);
      
      expect(xray.children![1].labelKey).toBe('nav.xray.clients');
      expect(xray.children![1].href).toBe('/admin/xray/clients');
      expect(xray.children![1].icon).toBe(Key);
      
      expect(xray.children![2].labelKey).toBe('nav.xray.nodes');
      expect(xray.children![2].href).toBe('/admin/xray/nodes');
      expect(xray.children![2].icon).toBe(Settings);
      
      expect(xray.children![3].labelKey).toBe('nav.xray.routing');
      expect(xray.children![3].href).toBe('/admin/xray/routing');
      expect(xray.children![3].icon).toBe(Map);
    });

    it('should have Plans enabled', () => {
      const plans = navigationItems[4];
      expect(plans.labelKey).toBe('nav.plans');
      expect(plans.href).toBe('/admin/plans');
      expect(plans.icon).toBe(Package);
      expect(plans.disabled).toBeUndefined();
    });

    it('should have Logs enabled', () => {
      const logs = navigationItems[5];
      expect(logs.labelKey).toBe('nav.logs');
      expect(logs.href).toBe('/admin/logs');
      expect(logs.icon).toBe(FileText);
      expect(logs.disabled).toBeUndefined();
    });

    it('should have Monitoring as the last item', () => {
      const monitoring = navigationItems[6];
      expect(monitoring.labelKey).toBe('nav.monitoring');
      expect(monitoring.href).toBe('/admin/monitoring');
      expect(monitoring.icon).toBe(Monitor);
      expect(monitoring.disabled).toBeUndefined();
    });

    it('should have all top-level items with required properties', () => {
      navigationItems.forEach((item) => {
        expect(item).toHaveProperty('labelKey');
        expect(item).toHaveProperty('icon');
        expect(typeof item.labelKey).toBe('string');
        expect(item.icon).toBeDefined();
      });
    });

    it('should have unique hrefs for all items with hrefs', () => {
      const getAllHrefs = (items: typeof navigationItems): string[] => {
        const hrefs: string[] = [];
        items.forEach(item => {
          if (item.href) hrefs.push(item.href);
          if (item.children) hrefs.push(...getAllHrefs(item.children));
        });
        return hrefs;
      };
      
      const hrefs = getAllHrefs(navigationItems);
      const uniqueHrefs = new Set(hrefs);
      expect(hrefs.length).toBe(uniqueHrefs.size);
    });

    it('should have all hrefs starting with /admin', () => {
      const checkHrefs = (items: typeof navigationItems) => {
        items.forEach((item) => {
          if (item.href) {
            expect(item.href).toMatch(/^\/admin/);
          }
          if (item.children) {
            checkHrefs(item.children);
          }
        });
      };
      checkHrefs(navigationItems);
    });

    it('should have all main navigation items enabled', () => {
      // In the Full Admin Control Center, all items should be enabled
      const disabledItems = navigationItems.filter((item) => item.disabled);
      expect(disabledItems).toHaveLength(0);
    });
    
    it('should not include Servers menu item (replaced by Nodes under Xray Management)', () => {
      const hasServers = navigationItems.some((item) => item.labelKey === 'nav.servers');
      expect(hasServers).toBe(false);
    });
  });

  describe('NavigationItem type validation', () => {
    it('should validate that each item conforms to NavigationItem interface', () => {
      const validateItem = (item: typeof navigationItems[0]) => {
        // Required properties
        expect(item.labelKey).toBeDefined();
        expect(item.icon).toBeDefined();
        
        // Type checks
        expect(typeof item.labelKey).toBe('string');
        
        // Optional property type checks
        if (item.href !== undefined) {
          expect(typeof item.href).toBe('string');
        }
        if (item.disabled !== undefined) {
          expect(typeof item.disabled).toBe('boolean');
        }
        if (item.children !== undefined) {
          expect(Array.isArray(item.children)).toBe(true);
          item.children.forEach(child => validateItem(child));
        }
      };
      
      navigationItems.forEach(validateItem);
    });
  });
});
