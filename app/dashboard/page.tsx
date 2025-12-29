'use client';

import { useSession, signOut } from 'next-auth/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RepositoryCard } from '@/components/dashboard/RepositoryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useState, useEffect } from 'react';

interface Repository {
  name: string;
  owner: string;
  url: string;
  description: string | null;
  language: string | null;
  starCount: number;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAuthEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
  
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/repositories');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch repositories');
      }
      
      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

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
          <div className="bg-white rounded-lg shadow-sm p-6">
            {loading && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Loading repositories...
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-6">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <ErrorMessage message={error} onRetry={fetchRepositories} />
            )}

            {!loading && !error && repositories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No repositories found</p>
              </div>
            )}

            {!loading && !error && repositories.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Repositories
                  </h2>
                  <span className="text-sm text-gray-500">
                    {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {repositories.map((repo) => (
                    <RepositoryCard key={repo.name} repository={repo} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
