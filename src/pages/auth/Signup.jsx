import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../lib/schemas';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layers, Mail, Lock, User, Info } from 'lucide-react';

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await signup(data.fullName, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // toast handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-4">
          <Layers className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Get started with BuildStaok stock inventory management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-elevated rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-10">
          {/* First user admin hint */}
          <div className="mb-5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5 text-xs text-indigo-800 dark:text-indigo-300">
            <Info className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
            <span>
              The first user created in the system automatically receives the <strong>Admin</strong> role. Subsequent users receive <strong>Staff</strong>.
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Ramesh Chandra"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="•••••••• (min 6 chars)"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
