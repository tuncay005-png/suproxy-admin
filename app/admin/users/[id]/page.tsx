/**
 * User Detail Page
 * 
 * Displays detailed information about a specific user.
 * 
 * @module app/admin/users/[id]/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserManagementActions } from '@/components/admin/users/user-management-actions';
import { UserEditForm } from '@/components/admin/users/user-edit-form';
import { UserStatusBadge } from '@/components/admin/users/user-status-badge';
import { UserRoleBadge } from '@/components/admin/users/user-role-badge';
import { RevokeAllSessionsDialog } from '@/components/admin/sessions/revoke-all-sessions-dialog';
import { UserSubscriptionCard } from '@/components/admin/users/user-subscription-card';
import Link from 'next/link';
import { ArrowLeft, Mail, Calendar, Shield, User as UserIcon, Activity } from 'lucide-react';
import { usersApi } from '@/lib/api/endpoints/users';
import { formatDate } from '@/lib/utils/format';

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getUserDetail(id: string) {
  try {
    const response = await usersApi.getById(id);
    return response.data;
  } catch (error) {
    console.error('[USER-DETAIL-PAGE] Failed to fetch user:', error);
    return null;
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = await getUserDetail(id);

  if (!user) {
    notFound();
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'N/A';

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <PageHeader
          heading="User Details"
          description={`Viewing information for ${user.email}`}
        />
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{fullName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <UserStatusBadge status={user.status as 'active' | 'inactive' | 'suspended'} />
              <UserRoleBadge role={user.role as 'user' | 'admin'} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email Address
              </div>
              <p className="text-sm">{user.email}</p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                Full Name
              </div>
              <p className="text-sm">{fullName}</p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Activity className="h-4 w-4" />
                Account Status
              </div>
              <UserStatusBadge status={user.status as 'active' | 'inactive' | 'suspended'} />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Shield className="h-4 w-4" />
                Role
              </div>
              <UserRoleBadge role={user.role as 'user' | 'admin'} />
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member Since
              </div>
              <p className="text-sm">{formatDate(user.created_at)}</p>
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                User ID
              </div>
              <p className="text-sm font-mono text-muted-foreground">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <UserSubscriptionCard userId={user.id} />

      {/* Edit User Card */}
      <Card>
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
          <CardDescription>Update user information</CardDescription>
        </CardHeader>
        <CardContent>
          <UserEditForm user={user} />
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user status, role, and account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementActions user={user} />
        </CardContent>
      </Card>

      {/* Session Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Manage active sessions for this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revoke all active sessions to immediately log the user out from all devices.
            </p>
            <RevokeAllSessionsDialog 
              userId={user.id}
              userEmail={user.email}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
