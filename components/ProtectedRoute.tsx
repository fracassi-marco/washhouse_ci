'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected route component
 * Checks authentication and redirects to login if not authenticated
 * When AUTH_ENABLED=false, always allows access
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if auth is enabled via environment variable
  const isAuthEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';

  useEffect(() => {
    // Only enforce authentication if enabled
    if (isAuthEnabled && status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router, isAuthEnabled]);

  // Show loading state while checking auth
  if (isAuthEnabled && status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is disabled or user is authenticated, show content
  if (!isAuthEnabled || status === 'authenticated') {
    return <>{children}</>;
  }

  // Don't show anything while redirecting
  return null;
}
