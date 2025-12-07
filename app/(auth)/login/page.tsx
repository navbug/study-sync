'use client';

import { useActionState } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/actions/auth';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setIsRedirecting(true);
      
      // Small delay to ensure cookie is set
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 100);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">StudySync</span>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Welcome Back
        </h2>

        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="your@email.com"
            required
            disabled={isPending}
          />

          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
            disabled={isPending}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isPending}
            isLoading={isPending || isRedirecting}
            content='Logging in...'
          >
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Register here
          </Link>
        </p>

        <Link href="/" className="block mt-4 text-center text-gray-500 hover:text-gray-700">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}