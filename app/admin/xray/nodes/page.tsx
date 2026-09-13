/**
 * Nodes Page - Server Component
 * 
 * Displays list of all server nodes with their configurations and health metrics.
 * Fetches initial data server-side and passes to client component for interactive features.
 * 
 * Route: /admin/xray/nodes
 * 
 * Features:
 * - Server-side data fetching for initial render
 * - Displays nodes in responsive data table
 * - Shows node type, status, and health metrics
 * - Actions: view, edit, delete
 * - Integrates with i18n for bilingual support
 * 
 * Validates: Requirements 7.3, 7.7, 7.10
 */

import { Suspense } from 'react';
import { NodesTable } from '@/components/admin/xray/nodes-table';
import { nodesApi } from '@/lib/api/endpoints/nodes';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * NodesPage Server Component
 * 
 * Fetches nodes data from backend and renders client component with initial data.
 * Uses Suspense for streaming and loading states.
 */
export default async function NodesPage() {
  try {
    // Fetch nodes data server-side
    const response = await nodesApi.list();
    const nodes = response.data.nodes || [];

    return (
      <div className="space-y-6">
        <Suspense fallback={<NodesTableSkeleton />}>
          <NodesTable initialData={nodes} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('[NodesPage] Failed to fetch nodes:', error);
    
    // Render client component with empty data on error
    // The component will show appropriate error state
    return (
      <div className="space-y-6">
        <NodesTable initialData={[]} />
      </div>
    );
  }
}

/**
 * Loading skeleton for nodes table
 */
function NodesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

/**
 * Metadata for SEO and page title
 */
export const metadata = {
  title: 'Nodes | Xray Management',
  description: 'Manage server nodes and their configurations',
};
