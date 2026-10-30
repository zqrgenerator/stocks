import React, { useState } from 'react';
import { useUsers, useUpdateUserRole } from '../../hooks/useInventory';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatDate } from '../../lib/utils';
import { Users as UsersIcon, Shield, Mail, UserCheck, Info } from 'lucide-react';
import { toast } from 'sonner';

export function Users() {
  const { data: users = [], isLoading } = useUsers();
  const updateUserRoleMutation = useUpdateUserRole();
  const { user: currentUser } = useAuth();

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRoleMutation.mutateAsync({ userId, role: newRole });
    } catch {
      // toast shown in mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-indigo-600" />
          User Accounts & Access Roles
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage system users, assign role-based permissions (Admin, Manager, Staff)
        </p>
      </div>

      {/* Invite Instructions Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
          <h4 className="font-bold">Team Member Invitation Workflow</h4>
          <p>
            Instruct new staff or managers to visit <strong>/signup</strong> and register with their email. Once registered, their account will default to the <strong>Staff</strong> role. You as the administrator can immediately promote them below to <strong>Manager</strong> or <strong>Admin</strong>.
          </p>
        </div>
      </div>

      {/* Users Table Card */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Registered System Users"
          subtitle={`${users.length} active profile(s) found`}
        />
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">User</th>
                    <th className="px-4 py-3.5">Current Role</th>
                    <th className="px-4 py-3.5">Registered Date</th>
                    <th className="px-4 py-3.5 text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {(u.full_name || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                {u.full_name}
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <Badge
                            variant={
                              u.role === 'admin'
                                ? 'primary'
                                : u.role === 'manager'
                                ? 'warning'
                                : 'neutral'
                            }
                            className="capitalize font-bold text-xs"
                          >
                            {u.role}
                          </Badge>
                        </td>

                        <td className="px-4 py-3.5 text-slate-500 text-xs">
                          {formatDate(u.created_at, 'dd MMM yyyy, hh:mm a')}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={isSelf}
                            className="text-xs h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
