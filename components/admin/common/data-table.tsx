/**
 * DataTable Component
 * 
 * A reusable, responsive data table component with search, sorting, and actions.
 * 
 * ## Features
 * 
 * - Configurable columns with custom rendering
 * - Search functionality with real-time filtering
 * - Column sorting (ascending/descending)
 * - Action dropdown menu for view/edit/delete operations
 * - Mobile-responsive card layout for small screens
 * - Desktop table layout for larger screens
 * - Empty state handling
 * - TypeScript type safety
 * 
 * ## Usage
 * 
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'status', label: 'Status', render: (value) => <Badge>{value}</Badge> },
 *   ]}
 *   data={items}
 *   searchable={true}
 *   searchPlaceholder="Search items..."
 *   actions={{
 *     view: (item) => console.log('View', item),
 *     edit: (item) => console.log('Edit', item),
 *     delete: (item) => console.log('Delete', item),
 *   }}
 * />
 * ```
 * 
 * Validates: Requirements 7.10, 8.1, 8.2, 8.5, 8.6
 * 
 * @module components/admin/common/data-table
 */

'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Column configuration for the data table
 */
export interface DataTableColumn<T = any> {
  /** Unique key for the column (should match data property) */
  key: string;
  /** Display label for column header */
  label: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Hide column on mobile screens */
  hiddenOnMobile?: boolean;
  /** Hide column on tablet screens */
  hiddenOnTablet?: boolean;
  /** Custom render function for cell content */
  render?: (value: any, item: T) => React.ReactNode;
  /** CSS class for the column cells */
  className?: string;
  /** CSS class for the header cell */
  headerClassName?: string;
}

/**
 * Action handlers for table rows
 */
export interface DataTableActions<T = any> {
  /** View action handler */
  view?: (item: T) => void;
  /** Edit action handler */
  edit?: (item: T) => void;
  /** Delete action handler */
  delete?: (item: T) => void;
}

/**
 * Props for DataTable component
 */
export interface DataTableProps<T = any> {
  /** Column configuration */
  columns: DataTableColumn<T>[];
  /** Data array to display */
  data: T[];
  /** Enable search functionality */
  searchable?: boolean;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Keys to search in (defaults to all column keys) */
  searchKeys?: string[];
  /** Enable sorting (can be overridden per column) */
  sortable?: boolean;
  /** Action handlers for rows */
  actions?: DataTableActions<T>;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Custom empty state description */
  emptyDescription?: string;
  /** CSS class for the table container */
  className?: string;
  /** Show row numbers */
  showRowNumbers?: boolean;
  /** Custom row key extractor (defaults to 'id') */
  getRowKey?: (item: T, index: number) => string | number;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string | null;
  direction: SortDirection;
}

/**
 * Get nested property value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * DataTable Component
 * 
 * Responsive data table with search, sort, and actions.
 * Switches to card layout on mobile screens (< 768px).
 */
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys,
  sortable = true,
  actions,
  emptyMessage = 'No data available',
  emptyDescription = 'There are no items to display at this time.',
  className,
  showRowNumbers = false,
  getRowKey = (item, index) => item.id ?? index,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({ key: null, direction: null });

  // Determine which keys to search
  const effectiveSearchKeys = useMemo(() => {
    return searchKeys ?? columns.map(col => col.key);
  }, [searchKeys, columns]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      return effectiveSearchKeys.some(key => {
        const value = getNestedValue(item, key);
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, effectiveSearchKeys]);

  // Sort data based on sort state
  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.direction) {
      return filteredData;
    }

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortState.key!);
      const bValue = getNestedValue(b, sortState.key!);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Compare values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return sortState.direction === 'desc' ? sorted.reverse() : sorted;
  }, [filteredData, sortState]);

  // Handle column sort
  const handleSort = (columnKey: string) => {
    setSortState(prev => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  };

  // Get sort icon for column
  const getSortIcon = (columnKey: string) => {
    if (sortState.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortState.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Render cell content
  const renderCell = (column: DataTableColumn<T>, item: T) => {
    const value = getNestedValue(item, column.key);
    if (column.render) {
      return column.render(value, item);
    }
    return value != null ? String(value) : '—';
  };

  // Check if any actions are available
  const hasActions = actions && (actions.view || actions.edit || actions.delete);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedData.length === 0 && (
        <EmptyState
          icon={Search}
          title={searchQuery ? 'No results found' : emptyMessage}
          description={
            searchQuery
              ? 'Try adjusting your search terms or filters.'
              : emptyDescription
          }
        />
      )}

      {/* Desktop Table View (≥768px) */}
      {sortedData.length > 0 && (
        <>
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {showRowNumbers && (
                    <TableHead className="w-[50px]">#</TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        column.headerClassName,
                        column.hiddenOnTablet && 'hidden lg:table-cell',
                        column.sortable !== false && sortable && 'cursor-pointer select-none'
                      )}
                      onClick={() => {
                        if (column.sortable !== false && sortable) {
                          handleSort(column.key);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {column.sortable !== false && sortable && getSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                  {hasActions && (
                    <TableHead className="w-[50px] text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow key={getRowKey(item, index)}>
                    {showRowNumbers && (
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          column.className,
                          column.hiddenOnTablet && 'hidden lg:table-cell'
                        )}
                      >
                        {renderCell(column, item)}
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Actions menu"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {actions?.view && (
                              <DropdownMenuItem onClick={() => actions.view!(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                            )}
                            {actions?.edit && (
                              <DropdownMenuItem onClick={() => actions.edit!(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {actions?.delete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => actions.delete!(item)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View (<768px) */}
          <div className="space-y-4 md:hidden">
            {sortedData.map((item, index) => (
              <Card key={getRowKey(item, index)}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {showRowNumbers && (
                      <div className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </div>
                    )}
                    {columns
                      .filter(col => !col.hiddenOnMobile)
                      .map((column) => (
                        <div key={column.key} className="flex justify-between items-start">
                          <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                            {column.label}
                          </span>
                          <span className="text-sm text-right flex-1">
                            {renderCell(column, item)}
                          </span>
                        </div>
                      ))}
                    {hasActions && (
                      <div className="flex gap-2 pt-2 border-t">
                        {actions?.view && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actions.view!(item)}
                            className="flex-1"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        )}
                        {actions?.edit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actions.edit!(item)}
                            className="flex-1"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        )}
                        {actions?.delete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actions.delete!(item)}
                            className="flex-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
