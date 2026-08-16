/**
 * Server and Node infrastructure TypeScript type definitions
 * These types define server and node entities for infrastructure management
 */

/**
 * Server entity representing a physical or virtual machine
 */
export interface Server {
  id: string;
  name: string;
  country: string;
  city: string;
  ip_address: string;
  status: 'online' | 'offline' | 'maintenance';
  node_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Node entity representing a service or process running on a server
 */
export interface Node {
  id: string;
  server_id: string;
  type: 'xray' | 'database' | 'service';
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  health_metrics: {
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Response structure for servers list endpoint
 */
export interface ServersListResponse {
  servers: Server[];
  total: number;
}

/**
 * Response structure for nodes list endpoint
 */
export interface NodesListResponse {
  nodes: Node[];
  total: number;
}
