'use client';

import { type FormEvent, type ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';
import { registerSchema } from '@/lib/validation';
import type { ZodError } from 'zod';

export function RegisterForm(): ReactNode {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    try {
      registerSchema.parse({ email, password, confirmPassword });
    } catch (err) {
      const zodErr = err as ZodError;
      const fieldErrors: Record<string, string> = {};
      zodErr.errors.forEach((e) => {
        const field = e.path[0] as string;
        fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await register(email, password, confirmPassword);
      router.push('/dashboard');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <fieldset>
        <legend className="sr-only">Register</legend>
        {serverError && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {serverError}
          </p>
        )}
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="mt-6">
          <Button type="submit" loading={loading} className="w-full">
            Create account
          </Button>
        </div>
      </fieldset>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </form>
  );
}
