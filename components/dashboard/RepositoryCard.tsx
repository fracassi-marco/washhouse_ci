import { formatDaysAgo, formatDate } from '@/lib/utils/formatters';

interface Repository {
  name: string;
  owner: string;
  url: string;
  description: string | null;
  language: string | null;
  starCount: number;
  updatedAt: string;
  releaseStats?: {
    totalReleases: number;
    semanticReleases: number;
    latestRelease: {
      tagName: string;
      date: string;
      version: string | null;
    } | null;
    latestSemanticRelease: {
      tagName: string;
      date: string;
      version: string | null;
    } | null;
    daysSinceLatestRelease: number | null;
  } | null;
}

interface RepositoryCardProps {
  repository: Repository;
}

/**
 * Repository card component
 * Displays repository information in a card format
 */
export function RepositoryCard({ repository }: RepositoryCardProps) {
  const handleClick = () => {
    window.open(repository.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {repository.name}
        </h3>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {repository.description || 'No description available'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {repository.language && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-gray-700">{repository.language}</span>
            </div>
          )}
          {repository.starCount > 0 && (
            <div className="flex items-center gap-1 text-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{repository.starCount}</span>
            </div>
          )}
        </div>
        <span className="text-gray-500 text-xs">
          Updated {new Date(repository.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Release Information */}
      {repository.releaseStats && repository.releaseStats.totalReleases > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{repository.releaseStats.totalReleases} {repository.releaseStats.totalReleases === 1 ? 'release' : 'releases'}</span>
              </div>
              {repository.releaseStats.latestSemanticRelease && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                    v{repository.releaseStats.latestSemanticRelease.version}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formatDaysAgo(repository.releaseStats.daysSinceLatestRelease || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
