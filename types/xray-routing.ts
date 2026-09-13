/**
 * Xray Routing TypeScript type definitions
 * These types define routing rules and related structures
 */

/**
 * Xray routing rule entity representing traffic routing configuration
 */
export interface XrayRoutingRule {
  id: string;
  name: string;
  type: 'field' | 'domain' | 'ip' | 'port' | 'network' | 'protocol';
  action: 'direct' | 'block' | 'proxy';
  conditions: Record<string, unknown>; // Rule-specific conditions
  priority: number;
  enabled: boolean;
  instance_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Input data required to create a new routing rule
 */
export interface CreateRoutingRuleInput {
  name: string;
  type: 'field' | 'domain' | 'ip' | 'port' | 'network' | 'protocol';
  action: 'direct' | 'block' | 'proxy';
  conditions: Record<string, unknown>;
  priority?: number;
  instance_id?: string;
}
