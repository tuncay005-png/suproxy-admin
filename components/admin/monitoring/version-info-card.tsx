/**
 * VersionInfoCard Component
 * 
 * Displays application version information including version number,
 * build date, and git commit hash.
 * 
 * ## Features
 * 
 * - Version number display
 * - Build date with formatted timestamp
 * - Git commit hash (short format)
 * - Error handling with red indicator when version check fails
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 10.4, 10.6
 * - 10.4: Display API version information from GET /api/v1/admin/system/version
 * - 10.6: Display red error indicator when version check fails
 * 
 * @module components/admin/monitoring/version-info-card
 */

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, AlertCircle, Tag, Calendar, GitBranch } from 'lucide-react';
import type { VersionInfo } from '@/types/system';

export interface VersionInfoCardProps {
  /**
   * Version information data from the API
   * null indicates failed version check
   */
  version: VersionInfo | null;
}

/**
 * Format build date for display
 */
function formatBuildDate(buildDate: string): string {
  try {
    const date = new Date(buildDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return buildDate;
  }
}

/**
 * Truncate git commit hash to short format (first 7 characters)
 */
function formatGitCommit(commit: string | undefined | null): string {
  if (!commit) {
    return 'N/A';
  }
  if (commit.length > 7) {
    return commit.substring(0, 7);
  }
  return commit;
}

/**
 * VersionInfoCard component for displaying application version
 * 
 * @example
 * ```tsx
 * <VersionInfoCard version={versionData} />
 * ```
 * 
 * @example
 * ```tsx
 * // Error state (failed version check)
 * <VersionInfoCard version={null} />
 * ```
 */
export function VersionInfoCard({ version }: VersionInfoCardProps) {
  // Error state - version check failed
  if (!version) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-red-500" />
            <CardTitle>Version Information</CardTitle>
          </div>
          <CardDescription>Application version and build details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Version check failed</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to retrieve version information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Version Information</CardTitle>
        </div>
        <CardDescription>Application version and build details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Version */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Version:</span>
          </div>
          <Badge variant="outline" className="font-mono">
            {version.version}
          </Badge>
        </div>

        {/* Build Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Build Date:</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatBuildDate(version.build_date)}
          </span>
        </div>

        {/* Git Commit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Commit:</span>
          </div>
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {formatGitCommit(version.git_commit)}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
