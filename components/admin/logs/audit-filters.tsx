/**
 * Audit Filters Component
 * 
 * Provides filtering controls for audit logs including action type,
 * entity type, and date range filters.
 * 
 * ## Features
 * 
 * - Action type dropdown filter
 * - Entity type dropdown filter
 * - Date range input filters (start and end date)
 * - URL state management for filters
 * - Clear filters functionality
 * 
 * Validates: Requirements 9.3, 9.4, 9.5
 * 
 * @module components/admin/logs/audit-filters
 */

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from './date-range-picker';

export interface AuditFiltersProps {
  /**
   * Current filter values
   */
  currentFilters: {
    action?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
  };
}

/**
 * Common action types for filtering
 */
const ACTION_TYPES = [
  { value: 'user.create', label: 'User Create' },
  { value: 'user.update', label: 'User Update' },
  { value: 'user.delete', label: 'User Delete' },
  { value: 'user.status_change', label: 'User Status Change' },
  { value: 'user.role_change', label: 'User Role Change' },
  { value: 'session.revoke', label: 'Session Revoke' },
  { value: 'xray.instance.start', label: 'Xray Instance Start' },
  { value: 'xray.instance.stop', label: 'Xray Instance Stop' },
  { value: 'xray.instance.restart', label: 'Xray Instance Restart' },
  { value: 'xray.inbound.create', label: 'Xray Inbound Create' },
  { value: 'xray.inbound.update', label: 'Xray Inbound Update' },
  { value: 'xray.inbound.delete', label: 'Xray Inbound Delete' },
  { value: 'xray.client.create', label: 'Xray Client Create' },
  { value: 'xray.client.delete', label: 'Xray Client Delete' },
  { value: 'plan.create', label: 'Plan Create' },
  { value: 'plan.update', label: 'Plan Update' },
  { value: 'plan.delete', label: 'Plan Delete' },
];

/**
 * Entity types for filtering
 */
const ENTITY_TYPES = [
  { value: 'user', label: 'User' },
  { value: 'session', label: 'Session' },
  { value: 'xray_instance', label: 'Xray Instance' },
  { value: 'xray_inbound', label: 'Xray Inbound' },
  { value: 'xray_client', label: 'Xray Client' },
  { value: 'plan', label: 'Plan' },
  { value: 'server', label: 'Server' },
];

/**
 * Audit filters component
 * 
 * Provides dropdown filters for action and entity type, plus date range inputs.
 * Updates URL search params when filters change.
 * 
 * @example
 * ```tsx
 * <AuditFilters 
 *   currentFilters={{
 *     action: 'user.create',
 *     entity_type: 'user'
 *   }}
 * />
 * ```
 */
export function AuditFilters({ currentFilters }: AuditFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update a specific filter
  const updateFilter = React.useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to first page when filters change
    params.set('page', '1');
    
    router.push(`/admin/logs?${params.toString()}`);
  }, [router, searchParams]);

  // Clear all filters
  const clearFilters = React.useCallback(() => {
    const params = new URLSearchParams();
    // Keep page size if it exists
    const currentLimit = searchParams.get('limit');
    if (currentLimit) {
      params.set('limit', currentLimit);
    }
    router.push(`/admin/logs?${params.toString()}`);
  }, [router, searchParams]);

  // Check if any filters are active
  const hasActiveFilters = currentFilters.action || 
    currentFilters.entity_type || 
    currentFilters.start_date || 
    currentFilters.end_date;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 lg:px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Action Filter */}
            <div className="space-y-2">
              <Label htmlFor="action-filter" className="text-sm">Action</Label>
              <Select
                value={currentFilters.action || 'all'}
                onValueChange={(value) => updateFilter('action', value === 'all' ? null : value)}
              >
                <SelectTrigger id="action-filter">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {ACTION_TYPES.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="entity-type-filter" className="text-sm">Entity Type</Label>
              <Select
                value={currentFilters.entity_type || 'all'}
                onValueChange={(value) => updateFilter('entity_type', value === 'all' ? null : value)}
              >
                <SelectTrigger id="entity-type-filter">
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities</SelectItem>
                  {ENTITY_TYPES.map((entity) => (
                    <SelectItem key={entity.value} value={entity.value}>
                      {entity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-range-picker" className="text-sm">Date Range</Label>
              <DateRangePicker
                dateRange={{
                  start_date: currentFilters.start_date,
                  end_date: currentFilters.end_date,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
