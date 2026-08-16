/**
 * Xray proxy TypeScript type definitions
 * These types define Xray instances, inbounds, clients, and related structures
 */

/**
 * Xray instance entity representing a running Xray proxy server
 */
export interface XrayInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  server_id: string;
  server_name: string;
  uptime: number; // seconds
  created_at: string;
  updated_at: string;
}

/**
 * Health status information for an Xray instance
 */
export interface XrayInstanceHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  uptime: number;
  last_check: string;
  error_message?: string;
}

/**
 * Statistics for an Xray instance
 */
export interface XrayInstanceStats {
  connections_active: number;
  connections_total: number;
  traffic_up: number;
  traffic_down: number;
  clients_active: number;
  clients_total: number;
}

/**
 * Xray inbound configuration entity
 */
export interface XrayInbound {
  id: string;
  instance_id: string;
  protocol: 'vless' | 'vmess' | 'trojan' | 'shadowsocks';
  port: number;
  tag: string;
  enabled: boolean;
  settings: Record<string, unknown>; // Protocol-specific settings
  created_at: string;
  updated_at: string;
}

/**
 * Input data required to create a new Xray inbound
 */
export interface CreateInboundInput {
  instance_id: string;
  protocol: 'vless' | 'vmess' | 'trojan' | 'shadowsocks';
  port: number;
  tag: string;
  settings: Record<string, unknown>;
}

/**
 * Xray client entity representing an individual user's access configuration
 */
export interface XrayClient {
  id: string;
  email: string;
  uuid: string;
  inbound_id: string;
  inbound_tag: string;
  enabled: boolean;
  traffic_up: number;
  traffic_down: number;
  created_at: string;
  updated_at: string;
}

/**
 * Input data required to create a new Xray client
 */
export interface CreateClientInput {
  email: string;
  inbound_id: string;
  settings?: Record<string, unknown>;
}

/**
 * Client configuration data including connection details
 */
export interface XrayClientConfig {
  protocol: string;
  address: string;
  port: number;
  uuid: string;
  connection_url: string;
  qr_code_data: string;
}
