import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { User, Lock, Mail, Shield, Key } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, updatePasswordSchema } from '../../lib/schemas';
import { toast } from 'sonner';

export function Profile() {
  const { user, profile, role, refreshProfile } = useAuth();
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    formState: { errors: nameErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name || '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onUpdateName = async (data) => {
    if (!user?.id) return;
    setIsUpdatingName(true);
    try {
      await dataService.updateProfile(user.id, { full_name: data.full_name });
      await refreshProfile();
      toast.success('Profile display name updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile name');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const onUpdatePassword = async (data) => {
    setIsUpdatingPassword(true);
    try {
      // In Supabase, update password via auth.updateUser
      if (dataService.updateUserPassword) {
        await dataService.updateUserPassword(data.newPassword);
      }
      resetPasswordForm();
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" />
          My Profile & Security
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal account details, credentials, and access role
        </p>
      </div>

      {/* Account Info Card */}
      <Card>
        <CardHeader title="Account Information" />
        <CardContent className="p-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {profile?.full_name || 'BuildStaok User'}
              </h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="primary" className="capitalize font-bold text-xs">
                  {role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Update Name Form */}
          <form onSubmit={handleSubmitName(onUpdateName)} className="pt-6 space-y-4">
            <Input
              label="Full Display Name *"
              leftIcon={<User className="w-4 h-4" />}
              error={nameErrors.full_name?.message}
              {...registerName('full_name')}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingName}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader title="Change Password" subtitle="Ensure your account uses a secure password" />
        <CardContent className="p-6">
          <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
            <Input
              label="New Password *"
              type="password"
              placeholder="•••••••• (minimum 6 characters)"
              leftIcon={<Key className="w-4 h-4" />}
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />
            <Input
              label="Confirm New Password *"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword')}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="outline" size="sm" isLoading={isUpdatingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
