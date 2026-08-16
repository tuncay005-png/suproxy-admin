/**
 * Instance Control Buttons Component
 * 
 * Provides control operations for Xray instances: start, stop, restart, and reload.
 * 
 * ## Features
 * 
 * - Start button (visible only when status is "stopped")
 * - Stop button (visible only when status is "running") with confirmation dialog
 * - Restart button (visible only when status is "running")
 * - Reload Config button (visible only when status is "running")
 * - Loading states during operations
 * - Success/error toast notifications
 * - Automatic data refresh after operations
 * - Confirmation dialog for Stop operation
 * 
 * Validates: Requirements 4.3-4.6, 4.10, 16.3
 * 
 * @module components/admin/xray/instances/instance-control-buttons
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Play, Square, RotateCw, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';
import { xrayApi } from '@/lib/api/endpoints/xray';
import type { XrayInstance } from '@/types/xray';

export interface InstanceControlButtonsProps {
  /**
   * The Xray instance to control
   */
  instance: XrayInstance;
}

/**
 * Instance control buttons component
 * 
 * Displays action buttons based on instance status and handles control operations.
 * 
 * Button visibility rules:
 * - Start: Only shown when status is "stopped"
 * - Stop: Only shown when status is "running"
 * - Restart: Only shown when status is "running"
 * - Reload: Only shown when status is "running"
 * 
 * @example
 * ```tsx
 * <InstanceControlButtons instance={instanceData} />
 * ```
 */
export function InstanceControlButtons({ instance }: InstanceControlButtonsProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = React.useState(false);
  const [isStopping, setIsStopping] = React.useState(false);
  const [isRestarting, setIsRestarting] = React.useState(false);
  const [isReloading, setIsReloading] = React.useState(false);
  const [showStopDialog, setShowStopDialog] = React.useState(false);

  /**
   * Handle start operation
   * Requirement 4.3: Start a stopped Xray instance
   */
  const handleStart = async () => {
    setIsStarting(true);
    try {
      await xrayApi.instances.start(instance.id);
      
      // Requirement 4.10, 13.11: Show success toast
      toast.success(`Instance "${instance.name}" started successfully`);
      
      // Requirement 7.2: Refresh instance data after operation
      router.refresh();
    } catch (error) {
      // Requirement 4.10: Display error message from backend
      const errorMessage = error instanceof Error ? error.message : 'Failed to start instance';
      toast.error(errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * Handle stop operation
   * Requirement 4.4: Stop a running Xray instance
   * Requirement 16.3: Show confirmation dialog warning about service interruption
   */
  const handleStop = async () => {
    setIsStopping(true);
    try {
      await xrayApi.instances.stop(instance.id);
      
      // Requirement 4.10, 13.11: Show success toast
      toast.success(`Instance "${instance.name}" stopped successfully`);
      
      // Close dialog and refresh
      setShowStopDialog(false);
      router.refresh();
    } catch (error) {
      // Requirement 4.10: Display error message from backend
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop instance';
      toast.error(errorMessage);
    } finally {
      setIsStopping(false);
    }
  };

  /**
   * Handle restart operation
   * Requirement 4.5: Restart a running Xray instance
   */
  const handleRestart = async () => {
    setIsRestarting(true);
    try {
      await xrayApi.instances.restart(instance.id);
      
      // Requirement 4.10, 13.11: Show success toast
      toast.success(`Instance "${instance.name}" restarted successfully`);
      
      // Requirement 7.2: Refresh instance data after operation
      router.refresh();
    } catch (error) {
      // Requirement 4.10: Display error message from backend
      const errorMessage = error instanceof Error ? error.message : 'Failed to restart instance';
      toast.error(errorMessage);
    } finally {
      setIsRestarting(false);
    }
  };

  /**
   * Handle reload config operation
   * Requirement 4.6: Reload configuration for a running Xray instance
   */
  const handleReload = async () => {
    setIsReloading(true);
    try {
      await xrayApi.instances.reload(instance.id);
      
      // Requirement 4.10, 13.11: Show success toast
      toast.success(`Instance "${instance.name}" configuration reloaded successfully`);
      
      // Requirement 7.2: Refresh instance data after operation
      router.refresh();
    } catch (error) {
      // Requirement 4.10: Display error message from backend
      const errorMessage = error instanceof Error ? error.message : 'Failed to reload configuration';
      toast.error(errorMessage);
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Start Button - Only visible when stopped */}
        {instance.status === 'stopped' && (
          <Button
            size="sm"
            variant="default"
            onClick={handleStart}
            disabled={isStarting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
        )}

        {/* Stop Button - Only visible when running */}
        {instance.status === 'running' && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowStopDialog(true)}
            disabled={isStopping || isRestarting || isReloading}
          >
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
        )}

        {/* Restart Button - Only visible when running */}
        {instance.status === 'running' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRestart}
            disabled={isRestarting || isStopping || isReloading}
          >
            {isRestarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restarting...
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Restart
              </>
            )}
          </Button>
        )}

        {/* Reload Config Button - Only visible when running */}
        {instance.status === 'running' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReload}
            disabled={isReloading || isStopping || isRestarting}
          >
            {isReloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reloading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Config
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stop Confirmation Dialog */}
      {/* Requirement 16.3: Confirmation dialog warning about service interruption */}
      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Xray Instance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop instance &quot;{instance.name}&quot;?
              <br />
              <br />
              <strong className="text-destructive">
                This will interrupt proxy service for all connected clients.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* Requirement 16.7: Focus Cancel button by default */}
            <AlertDialogCancel disabled={isStopping}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStop}
              disabled={isStopping}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isStopping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                'Stop Instance'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
