/**
 * Dynamic navigation configuration for admin sidebar
 * 
 * This configuration supports extensibility by allowing easy addition
 * of new modules. Set disabled: true for future modules that are not
 * yet implemented.
 * 
 * Updated for 3X-UI transformation:
 * - Uses labelKey instead of hardcoded title for i18n support
 * - Expanded Xray Management submenu with Nodes and Routing
 * - Removed Servers menu item (replaced by Nodes under Xray)
 * - Updated icons to match 3X-UI design spec
 */

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
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  /** Translation key for the item label (e.g., 'nav.dashboard') */
  labelKey: string;
  /** Navigation href path */
  href?: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Mark item as disabled (shows "Coming Soon" label) */
  disabled?: boolean;
  /** Child items for expandable submenu */
  children?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
  {
    labelKey: 'nav.dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    labelKey: 'nav.users',
    href: '/admin/users',
    icon: Users,
  },
  {
    labelKey: 'nav.sessions',
    href: '/admin/sessions',
    icon: FileText,
  },
  {
    labelKey: 'nav.xray_management',
    icon: Rocket,
    children: [
      {
        labelKey: 'nav.xray.inbounds',
        href: '/admin/xray/inbounds',
        icon: Download,
      },
      {
        labelKey: 'nav.xray.clients',
        href: '/admin/xray/clients',
        icon: Key,
      },
      {
        labelKey: 'nav.xray.nodes',
        href: '/admin/xray/nodes',
        icon: Settings,
      },
      {
        labelKey: 'nav.xray.routing',
        href: '/admin/xray/routing',
        icon: Map,
      },
    ],
  },
  {
    labelKey: 'nav.plans',
    href: '/admin/plans',
    icon: Package,
  },
  {
    labelKey: 'nav.logs',
    href: '/admin/logs',
    icon: FileText,
  },
  {
    labelKey: 'nav.monitoring',
    href: '/admin/monitoring',
    icon: Monitor,
  },
];
