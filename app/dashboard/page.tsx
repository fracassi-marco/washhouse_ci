'use client';

import { useSession, signOut } from 'next-auth/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAuthEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Washhouse CI Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  GitHub Repository CI/CD Monitoring
                </p>
              </div>

              <div className="flex items-center gap-4">
                {isAuthEnabled ? (
                  <>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900">
                        {session?.user?.email || 'Unknown'}
                      </p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                    🔓 Auth Disabled (Dev Mode)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-green-50 rounded-full mb-4">
                <svg
                  className="w-16 h-16 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ✅ Feature 1 Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Authentication is working with feature flag support
              </p>

              <div className="max-w-2xl mx-auto text-left bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  What's working:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Domain layer: User model with email validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Infrastructure: NextAuth with Google OAuth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Feature flag: AUTH_ENABLED (default: false)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>UI: Login page with Google sign-in button</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Protected routes with automatic redirect</span>
                  </li>

                </ul>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Next: Feature 2 - Repository List 📋
                  </h4>
                  <p className="text-sm text-gray-600">
                    Display all GitHub organization repositories with basic info
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
