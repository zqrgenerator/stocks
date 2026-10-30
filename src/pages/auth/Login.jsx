import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, resetPasswordSchema } from '../../lib/schemas';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Layers, Mail, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
    reset: resetResetForm,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // toast shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data) => {
    try {
      await dataService.resetPassword(data.email);
      toast.success('Password reset instructions sent to your email.');
      resetResetForm();
      setResetModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    }
  };

  const handleQuickDemo = async (roleType) => {
    const email = roleType === 'admin' ? 'admin@buildstaok.com' : 'staff@buildstaok.com';
    const pwd = 'password123';
    setValue('email', email);
    setValue('password', pwd);
    try {
      await login(email, pwd);
      navigate('/dashboard');
    } catch {
      // Auto register if first time
      const { signup } = useAuth();
      await signup(roleType === 'admin' ? 'Master Admin' : 'Warehouse Staff', email, pwd);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-4">
          <Layers className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign in to BuildStaok
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Stock inventory management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-elevated rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Helpers */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 text-center font-medium mb-3">
              Fast Testing One-Click Access:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemo('admin')}
                className="text-xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Demo Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemo('staff')}
                className="text-xs flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Demo Staff
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset your password"
        description="Enter your registered email address to receive password reset instructions."
      >
        <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={resetErrors.email?.message}
            {...resetRegister('email')}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isResetSubmitting}
            >
              Send Instructions
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
