/**
 * XraySystemCard Component
 * 
 * Displays Xray system-wide statistics including instance and client counts.
 * Shows total, running, and stopped instances, as well as client information.
 * 
 * ## Features
 * 
 * - Total Xray instances count
 * - Running instances count with green indicator
 * - Stopped instances count with gray indicator
 * - Total clients count
 * - Active clients count with green indicator
 * - Error handling with red indicator when Xray check fails
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 10.3, 10.6
 * - 10.3: Display Xray system status (instances running, total clients) from GET /api/v1/admin/system/xray
 * - 10.6: Display red error indicator when Xray check fails
 * 
 * @module components/admin/monitoring/xray-system-card
 */

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, AlertCircle, Server, Users, Power, CircleSlash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { XraySystemStatus } from '@/types/system';

export interface XraySystemCardProps {
  /**
   * Xray system status data from the API
   * null indicates failed Xray check
   */
  xray: XraySystemStatus | null;
}

/**
 * XraySystemCard component for displaying Xray system statistics
 * 
 * @example
 * ```tsx
 * <XraySystemCard xray={xrayData} />
 * ```
 * 
 * @example
 * ```tsx
 * // Error state (failed Xray check)
 * <XraySystemCard xray={null} />
 * ```
 */
export function XraySystemCard({ xray }: XraySystemCardProps) {
  // Error state - Xray check failed
  if (!xray) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-red-500" />
            <CardTitle>Xray System</CardTitle>
          </div>
          <CardDescription>Instance and client statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Xray check failed</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to retrieve Xray system status. The Xray service may be unavailable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Xray System</CardTitle>
        </div>
        <CardDescription>Instance and client statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instances Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Instances</span>
          </div>
          
          {/* Total Instances */}
          <div className="pl-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-sm font-semibold">{xray.instances_total}</span>
            </div>
            
            {/* Running Instances */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Power className="h-3 w-3 text-green-500" />
                <span className="text-sm text-muted-foreground">Running:</span>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white">
                {xray.instances_running}
              </Badge>
            </div>
            
            {/* Stopped Instances */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleSlash className="h-3 w-3 text-gray-500" />
                <span className="text-sm text-muted-foreground">Stopped:</span>
              </div>
              <Badge variant="secondary">
                {xray.instances_stopped}
              </Badge>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Clients Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Clients</span>
          </div>
          
          {/* Client Stats */}
          <div className="pl-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-sm font-semibold">{xray.clients_total}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active:</span>
              <Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white">
                {xray.clients_active}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
