# CI Dashboard - Hexagonal Architecture Implementation Plan

## Overview

This implementation plan follows Hexagonal Architecture (Ports and Adapters) principles. Each phase builds domain logic first, then use cases, and finally infrastructure adapters. This version includes ALL details from the original plan, reorganized according to hexagonal architecture principles.

**Key Principles:**
- Domain-first development (pure business logic, no framework dependencies)
- Dependency Inversion (dependencies point inward: Infrastructure → Use Cases → Domain)
- Test-driven development (TDD) at every layer
- Ports (interfaces) before adapters (implementations)
- Incremental progress with frequent integration
- No orphaned or unused code

**Architecture Layers:**
```
src/
├── domain/          # Pure business logic (NO framework dependencies)
│   ├── models/      # Business entities
│   ├── ports/       # Interfaces (contracts)
│   └── services/    # Pure calculation/transformation logic
├── usecase/         # Application orchestration
└── infrastructure/  # Framework & external dependencies
    ├── adapters/    # Implementations of ports
    ├── config/      # Environment & configuration
    └── lib/         # Framework utilities
```

---

## Phase 1: Project Foundation & Hexagonal Setup

### Step 1.1: Initialize Next.js Project with Hexagonal Structure

**Context:** Set up Next.js with hexagonal architecture folder structure under `src/`.

**Prompt:**
```
Create a new Next.js 14+ project with hexagonal architecture folder structure:

1. Initialize Next.js project:
   - Run create-next-app with these flags:
     * TypeScript enabled
     * Tailwind CSS enabled
     * App Router (not Pages Router)
     * Use npm as package manager
   - NOTE: Initially create WITHOUT src/ directory (we'll add src/ manually)

2. Install additional dependencies:
   - next-auth (latest version)
   - @octokit/rest
   - chart.js
   - react-chartjs-2

3. Create hexagonal architecture structure under src/:
   src/
   ├── domain/
   │   ├── models/
   │   ├── ports/
   │   └── services/
   ├── usecase/
   └── infrastructure/
       ├── adapters/
       │   ├── github/
       │   │   └── mappers/
       │   ├── cache/
       │   └── auth/
       ├── config/
       └── lib/

4. Keep Next.js defaults (outside src/):
   - /app (Next.js App Router)
   - /components (React components)
   - /types (shared types if needed)

5. Update tsconfig.json with path aliases:
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"],
         "@/src/*": ["./src/*"],
         "@/domain/*": ["./src/domain/*"],
         "@/usecase/*": ["./src/usecase/*"],
         "@/infrastructure/*": ["./src/infrastructure/*"],
         "@/components/*": ["./components/*"],
         "@/app/*": ["./app/*"]
       }
     }
   }

6. Create .env.local.example with placeholders:
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=
   GITHUB_TOKEN=
   GITHUB_ORG=

7. Add .env.local to .gitignore (if not already present)

8. Create initial README.md with:
   - Project overview
   - Hexagonal architecture explanation
   - Folder structure diagram
   - Setup instructions

9. Verify the setup:
   - Run dev server: npm run dev
   - Access http://localhost:3000
   - Confirm default Next.js page loads

Success criteria:
- Project runs without errors on http://localhost:3000
- All dependencies installed successfully
- Hexagonal folder structure created under src/
- Path aliases configured in tsconfig.json
- Environment template file exists
- README documents architecture approach
```

---

### Step 1.2: Define Domain Models (Pure Business Entities)

**Context:** Create domain models with zero framework dependencies. These represent core business concepts.

**Prompt:**
```
Create pure domain models for the CI Dashboard in src/domain/models/. NO framework imports allowed.

1. Create src/domain/models/Release.ts:
   - Release class (id, tagName, date, version)
   - SemanticVersion value object
   - ReleaseStats class (total, monthlyBreakdown, lastReleaseDate, daysSinceLastRelease)
   - MonthlyRelease interface for chart data

2. Create src/domain/models/Build.ts:
   - BuildRun class (id, status, createdAt, workflowName)
   - BuildStats class (totalSuccessful, totalAll, successRate)

3. Create src/domain/models/Activity.ts:
   - Commit class (sha, message, author, date)
   - PullRequest class (id, title, mergedAt)
   - CodeChurn value object (linesAdded, linesDeleted)
   - ActivityStats class (commits, mergedPRs, codeChurn)

4. Create src/domain/models/Contributor.ts:
   - Contributor class (id, username, contributionCount)
   - ContributorStats class (total)

5. Create src/domain/models/CommitFrequency.ts:
   - CommitFrequency class (averagePerWeek)

6. Create src/domain/models/Repository.ts:
   - Repository aggregate root that composes all the above
   - Constructor enforces invariants
   - Immutable by default

7. Create src/domain/models/OrganizationStats.ts:
   - OrganizationStats class (totalRepositories, releasesThisMonth, averageBuildSuccessRate)

8. Add comprehensive JSDoc comments
9. Export all from src/domain/models/index.ts

Success criteria:
- All models are pure TypeScript classes/interfaces
- NO imports from Next.js, React, Octokit, or any external library
- Models represent business concepts clearly
- Proper encapsulation and immutability
```

---

### Step 1.3: Define Domain Ports (Interfaces)

**Context:** Define abstractions for external dependencies. These are contracts that infrastructure will implement.

**Prompt:**
```
Create domain ports (interfaces) in src/domain/ports/. These define what the domain needs from the outside world.

1. Create src/domain/ports/IRepositoryProvider.ts:
   interface IRepositoryProvider {
     listRepositories(orgName: string): Promise<Repository[]>;
     getRepositoryTags(owner: string, repo: string): Promise<Release[]>;
     getWorkflowRuns(owner: string, repo: string, workflowName: string, since: Date): Promise<BuildRun[]>;
     getContributors(owner: string, repo: string): Promise<Contributor[]>;
     getCommitActivity(owner: string, repo: string, since: Date): Promise<Commit[]>;
     getMergedPullRequests(owner: string, repo: string, since: Date): Promise<PullRequest[]>;
     getCodeChurn(owner: string, repo: string, since: Date): Promise<CodeChurn>;
   }

2. Create src/domain/ports/ICacheProvider.ts:
   interface ICacheProvider<T> {
     get(key: string): Promise<T | null>;
     set(key: string, value: T, ttlMinutes?: number): Promise<void>;
     invalidate(key: string): Promise<void>;
     clear(): Promise<void>;
   }

3. Create src/domain/ports/ILogger.ts:
   interface ILogger {
     debug(message: string, context?: object): void;
     info(message: string, context?: object): void;
     warn(message: string, context?: object): void;
     error(message: string, error?: Error, context?: object): void;
   }

4. Create src/domain/ports/IAuthProvider.ts:
   interface IAuthProvider {
     getCurrentUser(): Promise<User | null>;
     validateDomain(email: string, allowedDomain: string): boolean;
   }

5. Export all from src/domain/ports/index.ts

Success criteria:
- All ports are pure interfaces
- NO concrete implementations yet
- Clear method signatures with proper types
- Domain models used in signatures (Repository, Release, etc.)
```

---

### Step 1.4: Create Domain Services (Pure Business Logic)

**Context:** Implement pure business logic functions with no framework dependencies.

**Prompt:**
```
Create domain services in src/domain/services/ with pure business logic calculations.

1. Create src/domain/services/ReleaseCalculator.ts:
   class ReleaseCalculator {
     static filterSemanticVersions(releases: Release[]): Release[]
     static calculateMonthlyBreakdown(releases: Release[], monthsBack: number): MonthlyRelease[]
     static calculateDaysSince(date: Date): number
     static isWithinLastYear(date: Date): boolean
     static isWithinLastMonth(date: Date): boolean
   }

2. Create src/domain/services/BuildStatisticsCalculator.ts:
   class BuildStatisticsCalculator {
     static calculateSuccessRate(builds: BuildRun[]): number
     static filterByTimeRange(builds: BuildRun[], since: Date): BuildRun[]
     static countSuccessful(builds: BuildRun[]): number
   }

3. Create src/domain/services/ActivityAggregator.ts:
   class ActivityAggregator {
     static aggregateActivity(
       commits: Commit[],
       prs: PullRequest[],
       codeChurn: CodeChurn
     ): ActivityStats
     
     static calculateCommitFrequency(commits: Commit[]): CommitFrequency
   }

4. Create src/domain/services/OrganizationStatsCalculator.ts:
   class OrganizationStatsCalculator {
     static calculate(repositories: Repository[]): OrganizationStats
     static countReleasesThisMonth(repositories: Repository[]): number
     static calculateAverageBuildSuccessRate(repositories: Repository[]): number
   }

5. Write unit tests for each service (NO mocking needed - pure functions!)
6. Export all from src/domain/services/index.ts

Success criteria:
- All services are pure static functions
- NO external dependencies (framework-free)
- Comprehensive unit tests with 100% coverage
- All tests pass
- Functions are deterministic and testable
```

---

## Phase 2: Use Case Layer (Application Logic)

### Step 2.1: Create FetchRepositoryData Use Case

**Context:** Orchestrate domain logic to fetch and process data for a single repository.

**Prompt:**
```
Create the first use case that orchestrates fetching repository data using ports.

1. Create src/usecase/FetchRepositoryData.ts:
   export class FetchRepositoryData {
     constructor(
       private repositoryProvider: IRepositoryProvider,
       private logger: ILogger
     ) {}
     
     async execute(request: FetchRepositoryDataRequest): Promise<Repository> {
       // 1. Fetch tags and filter semantic versions
       // 2. Fetch workflow runs for builds
       // 3. Fetch contributors
       // 4. Fetch commit activity
       // 5. Fetch merged PRs
       // 6. Fetch code churn
       // 7. Use domain services to calculate stats
       // 8. Return Repository aggregate
     }
   }

2. Define request/response DTOs:
   interface FetchRepositoryDataRequest {
     owner: string;
     repoName: string;
     workflowName: string;
     monthsBack: number;
     daysBack: number;
   }

3. Handle errors gracefully (skip repo on error, log issue)

4. Write tests with mocked ports (test orchestration logic)

Success criteria:
- Use case depends only on ports (interfaces)
- NO concrete implementations imported
- Uses domain services for calculations
- Tests use mock implementations of ports
- Error handling in place
```

---

### Step 2.2: Create FetchOrganizationData Use Case

**Context:** Orchestrate fetching data for all repositories in an organization with caching.

**Prompt:**
```
Create use case for fetching entire organization data with caching support.

1. Create src/usecase/FetchOrganizationData.ts:
   export class FetchOrganizationData {
     constructor(
       private repositoryProvider: IRepositoryProvider,
       private cacheProvider: ICacheProvider<OrganizationData>,
       private fetchRepositoryData: FetchRepositoryData,
       private logger: ILogger
     ) {}
     
     async execute(request: FetchOrganizationDataRequest): Promise<OrganizationData> {
       // 1. Check cache (unless forceRefresh)
       // 2. If cache hit, return cached data
       // 3. Fetch all repositories from provider
       // 4. For each repo, call FetchRepositoryData use case
       // 5. Process in parallel with concurrency limit (5)
       // 6. Calculate organization stats using OrganizationStatsCalculator
       // 7. Cache results
       // 8. Return data
     }
   }

2. Define DTOs:
   interface FetchOrganizationDataRequest {
     orgName: string;
     forceRefresh: boolean;
     workflowName: string;
   }
   
   interface OrganizationData {
     repositories: Repository[];
     stats: OrganizationStats;
     lastUpdated: Date;
   }

3. Implement concurrency control (max 5 parallel requests)

4. Write tests with mocked ports

Success criteria:
- Cache logic properly implemented
- Concurrency control works
- Uses OrganizationStatsCalculator for stats
- Handles errors gracefully (skips failed repos)
- Tests verify caching behavior
```

---

## Phase 3: Infrastructure Adapters (External Dependencies)

### Step 3.1: Implement GitHub Repository Provider

**Context:** Create concrete implementation of IRepositoryProvider using Octokit.

**Prompt:**
```
Implement the GitHub adapter in src/infrastructure/adapters/github/.

1. Create src/infrastructure/adapters/github/OctokitClient.ts:
   - Wrapper around Octokit with error handling
   - Rate limit handling with exponential backoff
   - Retry logic for transient failures

2. Create src/infrastructure/adapters/github/mappers/ReleaseMapper.ts:
   - Map GitHub tag API response to Release domain model
   - Extract semantic version information

3. Create src/infrastructure/adapters/github/mappers/BuildMapper.ts:
   - Map GitHub Actions workflow run to BuildRun domain model

4. Create src/infrastructure/adapters/github/mappers/RepositoryMapper.ts:
   - Map GitHub repository API response to basic Repository info

5. Create src/infrastructure/adapters/github/GitHubRepositoryProvider.ts:
   export class GitHubRepositoryProvider implements IRepositoryProvider {
     constructor(private octokit: OctokitClient, private orgName: string) {}
     
     async listRepositories(): Promise<Repository[]> {
       // Fetch from GitHub API
       // Map using RepositoryMapper
     }
     
     async getRepositoryTags(owner: string, repo: string): Promise<Release[]> {
       // Fetch tags
       // Map using ReleaseMapper
     }
     
     // Implement all other methods...
   }

6. Add retry logic for 202 responses (statistics endpoints)

7. Write integration tests (can use nock for HTTP mocking)

Success criteria:
- Implements IRepositoryProvider interface fully
- Uses Octokit for GitHub API calls
- Proper error handling and retries
- Mappers convert API DTOs to domain models
- Integration tests with mocked HTTP responses
```

---

### Step 3.2: Implement Cache Provider

**Context:** Create in-memory cache implementation.

**Prompt:**
```
Implement caching adapter in src/infrastructure/adapters/cache/.

1. Create src/infrastructure/adapters/cache/InMemoryCacheProvider.ts:
   export class InMemoryCacheProvider<T> implements ICacheProvider<T> {
     private cache: Map<string, CacheEntry<T>>;
     private static instance: InMemoryCacheProvider<any>;
     
     private constructor() {
       this.cache = new Map();
     }
     
     static getInstance<T>(): InMemoryCacheProvider<T> {
       // Singleton pattern
     }
     
     async get(key: string): Promise<T | null> {
       // Check if exists and not expired
     }
     
     async set(key: string, value: T, ttlMinutes = 15): Promise<void> {
       // Store with expiration timestamp
     }
     
     async invalidate(key: string): Promise<void> {
       // Remove from cache
     }
     
     async clear(): Promise<void> {
       // Clear all
     }
   }

2. Create CacheEntry interface:
   interface CacheEntry<T> {
     value: T;
     expiresAt: number;
   }

3. Add cache statistics tracking (hits/misses)

4. Write unit tests with fake timers for TTL

Success criteria:
- Implements ICacheProvider interface
- Singleton pattern for shared cache
- TTL expiration works correctly
- Statistics tracking functional
- All tests pass
```

---

### Step 3.3: Implement Auth Provider and Configuration

**Context:** Create authentication adapter and environment configuration.

**Prompt:**
```
Implement authentication adapter and configuration management.

1. Create src/infrastructure/config/env.ts:
   export class EnvironmentConfig {
     static get GOOGLE_CLIENT_ID(): string { ... }
     static get GOOGLE_CLIENT_SECRET(): string { ... }
     static get NEXTAUTH_URL(): string { ... }
     static get NEXTAUTH_SECRET(): string { ... }
     static get GITHUB_TOKEN(): string { ... }
     static get GITHUB_ORG(): string { ... }
     static get WORKFLOW_NAME(): string { return 'Build and Push to ECR'; }
     
     static validate(): void {
       // Validate all required env vars are present
     }
   }

2. Create src/infrastructure/adapters/auth/NextAuthProvider.ts:
   export class NextAuthProvider implements IAuthProvider {
     async getCurrentUser(): Promise<User | null> {
       // Use getServerSession from next-auth
     }
     
     validateDomain(email: string, allowedDomain: string): boolean {
       return email.endsWith(`@${allowedDomain}`);
     }
   }

3. Create src/infrastructure/lib/logger.ts:
   export class ConsoleLogger implements ILogger {
     // Implement logging methods
     // Respect environment (suppress debug in production)
   }

4. Create src/infrastructure/lib/errors.ts:
   - Custom error classes (GitHubApiError, AuthenticationError, etc.)

Success criteria:
- Environment validation on startup
- NextAuthProvider works with Next.js
- Logger implementation complete
- Custom errors defined
```

---

## Phase 4: Next.js Integration (Thin Controllers)

### Step 4.1: Configure NextAuth.js Authentication

**Context:** Set up NextAuth.js using our auth adapter.

**Prompt:**
```
Configure NextAuth.js in Next.js App Router with domain restriction.

1. Create app/api/auth/[...nextauth]/route.ts:
   - Configure Google OAuth provider
   - Use EnvironmentConfig for credentials
   - Use NextAuthProvider for domain validation

2. Update app/layout.tsx:
   - Wrap with SessionProvider
   - Use Suspense for loading state

3. Create app/page.tsx (temporary test page):
   - Show login button if not authenticated
   - Show user info if authenticated
   - Logout button

4. Test authentication flow:
   - Login with Google works
   - Session persists

Success criteria:
- NextAuth.js configured
- Domain restriction works
- Session management functional
```

---

### Step 4.2: Create Repositories API Route (Dependency Injection)

**Context:** Wire up use cases with concrete adapters using dependency injection.

**Prompt:**
```
Create API route that uses dependency injection to wire up the hexagonal architecture.

1. Create app/api/repositories/route.ts:
   export async function GET(request: Request) {
     // 1. Validate authentication
     const authProvider = new NextAuthProvider();
     const user = await authProvider.getCurrentUser();
     if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
     
     // 2. Create infrastructure adapters
     const octokit = new OctokitClient(EnvironmentConfig.GITHUB_TOKEN);
     const repositoryProvider = new GitHubRepositoryProvider(
       octokit,
       EnvironmentConfig.GITHUB_ORG
     );
     const cacheProvider = InMemoryCacheProvider.getInstance<OrganizationData>();
     const logger = new ConsoleLogger();
     
     // 3. Create use cases with dependency injection
     const fetchRepositoryData = new FetchRepositoryData(repositoryProvider, logger);
     const fetchOrgData = new FetchOrganizationData(
       repositoryProvider,
       cacheProvider,
       fetchRepositoryData,
       logger
     );
     
     // 4. Execute use case
     const { searchParams } = new URL(request.url);
     const result = await fetchOrgData.execute({
       orgName: EnvironmentConfig.GITHUB_ORG,
       forceRefresh: searchParams.get('refresh') === 'true',
       workflowName: EnvironmentConfig.WORKFLOW_NAME
     });
     
     // 5. Return response
     return Response.json(result);
   }

2. Add error handling with proper HTTP status codes

3. Add logging

Success criteria:
- Dependency injection works
- All layers connected properly
- Refresh parameter bypasses cache
- Error handling in place
```

---

## Phase 5: Frontend Components (Presentation Layer)

### Step 5.1: Create Dashboard Layout and Repository Cards

**Context:** Build React components that consume the API.

**Prompt:**
```
Create dashboard UI components that display repository data.

1. Create components/layout/Header.tsx:
   - Organization name
   - User profile with email
   - Logout button
   - Refresh button (calls API with ?refresh=true)
   - Last updated timestamp

2. Create components/dashboard/StatsSummary.tsx:
   - Display OrganizationStats
   - Three cards: total repos, releases this month, avg build success

3. Create components/dashboard/RepositoryCard.tsx:
   - Display Repository data
   - Click opens GitHub URL
   - Chart placeholder for now

4. Create components/dashboard/SearchBar.tsx:
   - Filter repositories by name
   - Client-side filtering

5. Create app/dashboard/page.tsx:
   - Fetch from /api/repositories
   - Protected route (check session)
   - Display StatsSummary
   - Display SearchBar
   - Grid of RepositoryCard components
   - Loading and error states

Success criteria:
- Dashboard displays all repository data
- Search filtering works
- Refresh button works
- Protected route only accessible when authenticated
```

---

### Step 5.2: Integrate Chart.js for Release History

**Context:** Add visual charts to repository cards.

**Prompt:**
```
Add Chart.js visualization for monthly release history.

1. Create components/charts/ReleaseChart.tsx:
   - Bar chart component
   - Takes MonthlyRelease[] as input
   - Displays last 12 months
   - Clean, minimal styling

2. Update RepositoryCard to include ReleaseChart

3. Add lazy loading with next/dynamic

Success criteria:
- Charts display monthly release data
- Responsive and clean design
- No performance issues with many charts
```

---

## Phase 6: Testing & Polish

### Step 6.1: Comprehensive Testing

**Context:** Add tests at all layers.

**Prompt:**
```
Add comprehensive test coverage:

1. Domain Layer Tests (pure unit tests):
   - ReleaseCalculator
   - BuildStatisticsCalculator
   - ActivityAggregator
   - OrganizationStatsCalculator

2. Use Case Tests (with mocked ports):
   - FetchRepositoryData
   - FetchOrganizationData
   - Test caching behavior
   - Test error handling

3. Infrastructure Tests:
   - GitHubRepositoryProvider (with nock for HTTP mocking)
   - InMemoryCacheProvider (with fake timers)
   - Mappers

4. Integration Tests:
   - Full flow from API route to database
   - Mock external GitHub API

Success criteria:
- 80%+ test coverage
- All layers tested appropriately
- Tests are fast and reliable
```

---

## Phase 7: Docker & Deployment

### Step 7.1: Create Docker Configuration

**Context:** Package application for deployment.

**Prompt:**
```
Create Docker configuration with multi-stage build:

1. Create Dockerfile:
   - Stage 1: Dependencies
   - Stage 2: Build
   - Stage 3: Production (minimal)
   - Use node:18-alpine
   - Non-root user

2. Create .dockerignore

3. Create docker-compose.yml for local development

4. Test build and run

Success criteria:
- Docker image builds successfully
- Application runs in container
- Image size < 200MB
```

---

## Benefits of This Approach

✅ **Pure Business Logic**: Domain layer has zero framework dependencies
✅ **Testability**: Each layer can be tested independently
✅ **Flexibility**: Easy to swap GitHub for another provider
✅ **Maintainability**: Clear separation of concerns
✅ **Scalability**: Use cases can be reused across different interfaces (API, CLI, etc.)

## Migration from Original Plan

The original plan had:
- `/lib/github/*` → Now split into domain services, use cases, and GitHub adapter
- `/lib/cache/*` → Now in infrastructure/adapters/cache
- `/lib/auth.ts` → Now in infrastructure/adapters/auth
- `/types/*` → Now domain models in src/domain/models

The new structure enforces:
1. Domain-first development
2. Dependency inversion
3. Clear layer boundaries
4. Better testability
