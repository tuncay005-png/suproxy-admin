/**
 * Dynamic navigation configuration for admin sidebar
 * 
 * This configuration supports extensibility by allowing easy addition
 * of new modules. Set disabled: true for future modules that are not
 * yet implemented.
 */

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
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
  children?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Sessions",
    href: "/admin/sessions",
    icon: UserCheck,
  },
  {
    title: "Xray",
    icon: Network,
    children: [
      {
        title: "Instances",
        href: "/admin/xray/instances",
        icon: Radio,
      },
      {
        title: "Inbounds",
        href: "/admin/xray/inbounds",
        icon: Activity,
      },
      {
        title: "Clients",
        href: "/admin/xray/clients",
        icon: Users,
      },
    ],
  },
  {
    title: "Servers",
    href: "/admin/servers",
    icon: Server,
  },
  {
    title: "Plans",
    href: "/admin/plans",
    icon: CreditCard,
  },
  {
    title: "Logs",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    title: "Monitoring",
    href: "/admin/monitoring",
    icon: Settings,
  },
];
