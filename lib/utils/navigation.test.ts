import { describe, it, expect } from 'vitest';
import { navigationItems } from './navigation';
import {
  Home,
  Users,
  UserCheck,
  Server,
  CreditCard,
  FileText,
  Network,
  Radio,
  Activity,
  Settings,
} from 'lucide-react';

describe('navigation configuration', () => {
  describe('navigationItems array', () => {
    it('should contain exactly 8 navigation items', () => {
      expect(navigationItems).toHaveLength(8);
    });

    it('should have Dashboard as the first item', () => {
      const dashboard = navigationItems[0];
      expect(dashboard.title).toBe('Dashboard');
      expect(dashboard.href).toBe('/admin');
      expect(dashboard.icon).toBe(Home);
      expect(dashboard.disabled).toBeUndefined();
    });

    it('should have Users as the second item', () => {
      const users = navigationItems[1];
      expect(users.title).toBe('Users');
      expect(users.href).toBe('/admin/users');
      expect(users.icon).toBe(Users);
      expect(users.disabled).toBeUndefined();
    });

    it('should have Sessions as the third item', () => {
      const sessions = navigationItems[2];
      expect(sessions.title).toBe('Sessions');
      expect(sessions.href).toBe('/admin/sessions');
      expect(sessions.icon).toBe(UserCheck);
      expect(sessions.disabled).toBeUndefined();
    });

    it('should have Xray section with children', () => {
      const xray = navigationItems[3];
      expect(xray.title).toBe('Xray');
      expect(xray.icon).toBe(Network);
      expect(xray.href).toBeUndefined();
      expect(xray.children).toBeDefined();
      expect(xray.children).toHaveLength(3);
      
      // Check Xray children
      expect(xray.children![0].title).toBe('Instances');
      expect(xray.children![0].href).toBe('/admin/xray/instances');
      expect(xray.children![0].icon).toBe(Radio);
      
      expect(xray.children![1].title).toBe('Inbounds');
      expect(xray.children![1].href).toBe('/admin/xray/inbounds');
      expect(xray.children![1].icon).toBe(Activity);
      
      expect(xray.children![2].title).toBe('Clients');
      expect(xray.children![2].href).toBe('/admin/xray/clients');
      expect(xray.children![2].icon).toBe(Users);
    });

    it('should have Servers enabled', () => {
      const servers = navigationItems[4];
      expect(servers.title).toBe('Servers');
      expect(servers.href).toBe('/admin/servers');
      expect(servers.icon).toBe(Server);
      expect(servers.disabled).toBeUndefined();
    });

    it('should have Plans enabled', () => {
      const plans = navigationItems[5];
      expect(plans.title).toBe('Plans');
      expect(plans.href).toBe('/admin/plans');
      expect(plans.icon).toBe(CreditCard);
      expect(plans.disabled).toBeUndefined();
    });

    it('should have Logs enabled', () => {
      const logs = navigationItems[6];
      expect(logs.title).toBe('Logs');
      expect(logs.href).toBe('/admin/logs');
      expect(logs.icon).toBe(FileText);
      expect(logs.disabled).toBeUndefined();
    });

    it('should have Monitoring as the last item', () => {
      const monitoring = navigationItems[7];
      expect(monitoring.title).toBe('Monitoring');
      expect(monitoring.href).toBe('/admin/monitoring');
      expect(monitoring.icon).toBe(Settings);
      expect(monitoring.disabled).toBeUndefined();
    });

    it('should have all top-level items with required properties', () => {
      navigationItems.forEach((item) => {
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('icon');
        expect(typeof item.title).toBe('string');
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
  });

  describe('NavigationItem type validation', () => {
    it('should validate that each item conforms to NavigationItem interface', () => {
      const validateItem = (item: typeof navigationItems[0]) => {
        // Required properties
        expect(item.title).toBeDefined();
        expect(item.icon).toBeDefined();
        
        // Type checks
        expect(typeof item.title).toBe('string');
        
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
