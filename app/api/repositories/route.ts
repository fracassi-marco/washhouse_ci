import { NextRequest, NextResponse } from 'next/server';
import { EnvironmentConfig } from '@/infrastructure/config';
import { ConsoleLogger } from '@/infrastructure/lib';
import { OctokitClient, GitHubRepositoryProvider } from '@/infrastructure/adapters/github';
import { FetchRepositories } from '@/usecase/FetchRepositories';
import { NextAuthProvider } from '@/infrastructure/adapters/auth';

export async function GET(request: NextRequest) {
  const logger = new ConsoleLogger();

  try {
    // Check authentication if enabled
    const authProvider = new NextAuthProvider();
    if (authProvider.isAuthEnabled()) {
      const user = await authProvider.getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      logger.info('Authenticated user accessing repositories', {
        email: user.email,
      });
    } else {
      logger.debug('Authentication disabled, allowing access');
    }

    // Validate GitHub configuration
    const githubOrg = EnvironmentConfig.GITHUB_ORG;
    if (!githubOrg) {
      return NextResponse.json(
        { error: 'GitHub organization not configured' },
        { status: 500 }
      );
    }

    const githubToken = EnvironmentConfig.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    // Create infrastructure adapters
    const octokitClient = new OctokitClient(githubToken);
    const repositoryProvider = new GitHubRepositoryProvider(
      octokitClient,
      githubOrg
    );

    // Create and execute use case
    const fetchRepositories = new FetchRepositories(
      repositoryProvider,
      logger
    );

    const repositories = await fetchRepositories.execute(githubOrg);

    // Return response
    return NextResponse.json({
      repositories: repositories.map(repo => ({
        name: repo.name,
        owner: repo.owner,
        url: repo.url,
        description: repo.description,
        language: repo.language,
        starCount: repo.starCount,
        updatedAt: repo.updatedAt.toISOString(),
        releaseStats: repo.releaseStats ? {
          totalReleases: repo.releaseStats.totalReleases,
          semanticReleases: repo.releaseStats.semanticReleases,
          latestRelease: repo.releaseStats.latestRelease ? {
            tagName: repo.releaseStats.latestRelease.tagName,
            date: repo.releaseStats.latestRelease.date.toISOString(),
            version: repo.releaseStats.latestRelease.version?.toString() || null,
          } : null,
          latestSemanticRelease: repo.releaseStats.latestSemanticRelease ? {
            tagName: repo.releaseStats.latestSemanticRelease.tagName,
            date: repo.releaseStats.latestSemanticRelease.date.toISOString(),
            version: repo.releaseStats.latestSemanticRelease.version?.toString() || null,
          } : null,
          daysSinceLatestRelease: repo.releaseStats.daysSinceLatestRelease,
        } : null,
      })),
      count: repositories.length,
      organization: githubOrg,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('API error', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch repositories',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
