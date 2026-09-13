/**
 * TypeScript type definitions for i18n system
 */

export type Locale = 'en' | 'ru';

/**
 * Translation dictionary structure
 */
export interface Translations {
  nav: {
    dashboard: string;
    users: string;
    sessions: string;
    xray_management: string;
    xray: {
      inbounds: string;
      clients: string;
      nodes: string;
      routing: string;
    };
    plans: string;
    logs: string;
    monitoring: string;
  };
  dashboard: {
    title: string;
    description: string;
    total_users: string;
    active_users: string;
    xray_instances: string;
    active_instances: string;
    servers: string;
    online_servers: string;
    plans: string;
    active_plans: string;
    recent_actions: string;
    xray_status: string;
    running: string;
    stopped: string;
    system_uptime: string;
    traffic_speed: string;
    total_traffic: string;
    data_unavailable: string;
    loading: string;
  };
  monitoring: {
    cpu_usage: string;
    ram_usage: string;
    disk_usage: string;
    swap_usage: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
  };
}

/**
 * I18n context value interface
 */
export interface I18nContextValue {
  /** Current active locale */
  locale: Locale;
  /** Loaded translations for current locale */
  translations: Translations;
  /** Function to change the active language */
  changeLanguage: (locale: Locale) => void;
  /** Translation function with dot notation support */
  t: (key: string) => string;
}
