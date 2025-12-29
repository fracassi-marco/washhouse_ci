# CI Dashboard - Implementation Checklist

**Project Start Date:** _________________  
**Target Completion:** _________________  
**Current Phase:** _________________

---

## Phase 0: Version Control Setup

### Git Repository Initialization
- [x] Verify you're in the project directory
- [x] Initialize git repository: `git init`
- [x] Create `.gitignore` file with Node.js defaults
- [x] Create initial README.md with project name and description
- [x] Make initial commit: `git add . && git commit -m "Initial commit"`
- [x] (Optional) Create remote repository on GitHub/GitLab
- [x] (Optional) Add remote: `git remote add origin <url>`
- [x] (Optional) Push initial commit: `git push -u origin main`

---

## Phase 1: Project Foundation & Hexagonal Architecture Setup

### Step 1.1: Initialize Next.js Project with Hexagonal Structure
- [x] Run `create-next-app` with TypeScript and Tailwind CSS
- [x] Verify project runs on http://localhost:3000
- [x] Install additional dependencies: next-auth, @octokit/rest, chart.js, react-chartjs-2
- [x] Create hexagonal architecture structure under `src/`:
  - [x] `src/domain/models/`
  - [x] `src/domain/ports/`
  - [x] `src/domain/services/`
  - [x] `src/usecase/`
  - [x] `src/infrastructure/adapters/github/mappers/`
  - [x] `src/infrastructure/adapters/cache/`
  - [x] `src/infrastructure/adapters/auth/`
  - [x] `src/infrastructure/config/`
  - [x] `src/infrastructure/lib/`
- [x] Keep Next.js defaults: /app, /components, /types (if needed)
- [x] Update tsconfig.json with path aliases for @/src/*, @/domain/*, @/usecase/*, @/infrastructure/*
- [x] Create `.env.local.example` with all required variables
- [x] Add `.env.local` to `.gitignore`
- [x] Update README.md with hexagonal architecture explanation
- [x] Commit: "🎉 Initialize project with hexagonal architecture"

### Step 1.2: Define Domain Models (Pure Business Entities - NO Framework Dependencies)
- [ ] Create `src/domain/models/Release.ts`
  - [ ] Release class (id, tagName, date, version)
  - [ ] SemanticVersion value object
  - [ ] ReleaseStats class
  - [ ] MonthlyRelease interface
- [ ] Create `src/domain/models/Build.ts`
  - [ ] BuildRun class
  - [ ] BuildStats class (totalSuccessful, totalAll, successRate)
- [ ] Create `src/domain/models/Activity.ts`
  - [ ] Commit class
  - [ ] PullRequest class
  - [ ] CodeChurn value object
  - [ ] ActivityStats class
- [ ] Create `src/domain/models/Contributor.ts`
  - [ ] Contributor class
  - [ ] ContributorStats class
- [ ] Create `src/domain/models/CommitFrequency.ts`
  - [ ] CommitFrequency class
- [ ] Create `src/domain/models/Repository.ts`
  - [ ] Repository aggregate root (composes all above)
  - [ ] Enforce invariants in constructor
  - [ ] Immutable by default
- [ ] Create `src/domain/models/OrganizationStats.ts`
  - [ ] OrganizationStats class
- [ ] Add comprehensive JSDoc comments to all models
- [ ] Create `src/domain/models/index.ts` for exports
- [ ] VERIFY: NO imports from Next.js, React, Octokit, or any external library
- [ ] Commit: "✨ Add domain models (pure business entities)"

### Step 1.3: Define Domain Ports (Interfaces - Contracts)
- [ ] Create `src/domain/ports/IRepositoryProvider.ts`
  - [ ] listRepositories(orgName: string): Promise<Repository[]>
  - [ ] getRepositoryTags(owner, repo): Promise<Release[]>
  - [ ] getWorkflowRuns(owner, repo, workflowName, since): Promise<BuildRun[]>
  - [ ] getContributors(owner, repo): Promise<Contributor[]>
  - [ ] getCommitActivity(owner, repo, since): Promise<Commit[]>
  - [ ] getMergedPullRequests(owner, repo, since): Promise<PullRequest[]>
  - [ ] getCodeChurn(owner, repo, since): Promise<CodeChurn>
- [ ] Create `src/domain/ports/ICacheProvider.ts`
  - [ ] get<T>(key: string): Promise<T | null>
  - [ ] set<T>(key, value, ttlMinutes?): Promise<void>
  - [ ] invalidate(key: string): Promise<void>
  - [ ] clear(): Promise<void>
- [ ] Create `src/domain/ports/ILogger.ts`
  - [ ] debug(message, context?): void
  - [ ] info(message, context?): void
  - [ ] warn(message, context?): void
  - [ ] error(message, error?, context?): void
- [ ] Create `src/domain/ports/IAuthProvider.ts`
  - [ ] getCurrentUser(): Promise<User | null>
  - [ ] validateDomain(email, allowedDomain): boolean
- [ ] Create `src/domain/ports/index.ts` for exports
- [ ] VERIFY: All ports are pure TypeScript interfaces
- [ ] Commit: "🔌 Define domain ports (interfaces)"

### Step 1.4: Create Domain Services (Pure Business Logic)
- [ ] Create `src/domain/services/ReleaseCalculator.ts`
  - [ ] static filterSemanticVersions(releases): Release[]
  - [ ] static calculateMonthlyBreakdown(releases, monthsBack): MonthlyRelease[]
  - [ ] static calculateDaysSince(date): number
  - [ ] static isWithinLastYear(date): boolean
  - [ ] static isWithinLastMonth(date): boolean
- [ ] Create `src/domain/services/BuildStatisticsCalculator.ts`
  - [ ] static calculateSuccessRate(builds): number
  - [ ] static filterByTimeRange(builds, since): BuildRun[]
  - [ ] static countSuccessful(builds): number
- [ ] Create `src/domain/services/ActivityAggregator.ts`
  - [ ] static aggregateActivity(commits, prs, codeChurn): ActivityStats
  - [ ] static calculateCommitFrequency(commits): CommitFrequency
- [ ] Create `src/domain/services/OrganizationStatsCalculator.ts`
  - [ ] static calculate(repositories): OrganizationStats
  - [ ] static countReleasesThisMonth(repositories): number
  - [ ] static calculateAverageBuildSuccessRate(repositories): number
- [ ] Create `src/domain/services/index.ts` for exports
- [ ] Write comprehensive unit tests for each service
  - [ ] NO mocking needed (pure functions!)
  - [ ] Test all edge cases
  - [ ] Aim for 100% coverage
- [ ] VERIFY: All services are pure static functions with NO external dependencies
- [ ] Commit: "🧮 Add domain services (pure business logic)"

---

## Phase 2: Use Case Layer (Application Orchestration)

### Step 2.1: Create FetchRepositoryData Use Case
- [ ] Create `src/usecase/FetchRepositoryData.ts`
  - [ ] Constructor accepts IRepositoryProvider and ILogger (dependency injection)
  - [ ] execute(request: FetchRepositoryDataRequest): Promise<Repository>
  - [ ] Define FetchRepositoryDataRequest interface (owner, repoName, workflowName, monthsBack, daysBack)
  - [ ] Orchestrate data fetching using provider
  - [ ] Use domain services for calculations (ReleaseCalculator, BuildStatisticsCalculator, ActivityAggregator)
  - [ ] Handle errors gracefully (return null on skip, log errors)
- [ ] Write tests with mocked ports
  - [ ] Mock IRepositoryProvider
  - [ ] Mock ILogger
  - [ ] Test orchestration logic
  - [ ] Test error handling
- [ ] VERIFY: Use case depends ONLY on domain ports (no concrete implementations)
- [ ] Commit: "🎯 Add FetchRepositoryData use case"

### Step 2.2: Create FetchOrganizationData Use Case
- [ ] Create `src/usecase/FetchOrganizationData.ts`
  - [ ] Constructor accepts IRepositoryProvider, ICacheProvider, FetchRepositoryData, ILogger
  - [ ] execute(request: FetchOrganizationDataRequest): Promise<OrganizationData>
  - [ ] Define FetchOrganizationDataRequest (orgName, forceRefresh, workflowName)
  - [ ] Define OrganizationData interface (repositories, stats, lastUpdated)
  - [ ] Check cache first (unless forceRefresh=true)
  - [ ] Fetch all repositories using provider
  - [ ] Process repositories in parallel (concurrency limit: 5)
  - [ ] Use OrganizationStatsCalculator for stats
  - [ ] Cache results
- [ ] Write tests with mocked ports
  - [ ] Test cache hit scenario
  - [ ] Test cache miss scenario
  - [ ] Test forceRefresh behavior
  - [ ] Test concurrency control
  - [ ] Test error handling (skip failed repos)
- [ ] VERIFY: Use case depends ONLY on domain ports
- [ ] Commit: "🎯 Add FetchOrganizationData use case"

---

## Phase 3: Infrastructure Layer - Adapters (External Dependencies)

### Step 3.1: Implement GitHub Repository Provider (Infrastructure Adapter)
- [ ] Create `src/infrastructure/adapters/github/OctokitClient.ts`
  - [ ] Wrapper around Octokit with error handling
  - [ ] Rate limit handling with exponential backoff
  - [ ] Retry logic for transient failures
- [ ] Create `src/infrastructure/adapters/github/mappers/ReleaseMapper.ts`
  - [ ] Map GitHub tag API response to Release domain model
  - [ ] Extract semantic version information
- [ ] Create `src/infrastructure/adapters/github/mappers/BuildMapper.ts`
  - [ ] Map GitHub Actions workflow run to BuildRun domain model
- [ ] Create `src/infrastructure/adapters/github/mappers/RepositoryMapper.ts`
  - [ ] Map GitHub repository API response to Repository info
- [ ] Create `src/infrastructure/adapters/github/mappers/index.ts` for exports
- [ ] Create `src/infrastructure/adapters/github/GitHubRepositoryProvider.ts`
  - [ ] Implements IRepositoryProvider interface
  - [ ] Constructor accepts OctokitClient and orgName
  - [ ] Implement all interface methods:
    - [ ] listRepositories() - fetch from GitHub API, map with RepositoryMapper
    - [ ] getRepositoryTags() - fetch tags, map with ReleaseMapper
    - [ ] getWorkflowRuns() - find workflow by name, fetch runs, map with BuildMapper
    - [ ] getContributors() - fetch and map contributors
    - [ ] getCommitActivity() - fetch commits with date filtering
    - [ ] getMergedPullRequests() - fetch merged PRs
    - [ ] getCodeChurn() - fetch code frequency stats
  - [ ] Add retry logic for 202 responses (statistics endpoints)
  - [ ] Handle workflow not found (return null)
  - [ ] Proper error handling throughout
- [ ] Write integration tests
  - [ ] Use nock for HTTP mocking
  - [ ] Test all provider methods
  - [ ] Test error scenarios
  - [ ] Test retry logic
  - [ ] Test pagination handling
- [ ] VERIFY: Provider implements IRepositoryProvider completely
- [ ] VERIFY: Uses mappers to convert DTOs to domain models
- [ ] Commit: "🔧 Implement GitHub repository provider adapter"

### Step 3.2: Implement Cache Provider (Infrastructure Adapter)
- [ ] Create `src/infrastructure/adapters/cache/InMemoryCacheProvider.ts`
  - [ ] Implements ICacheProvider<T> interface
  - [ ] Use Map for storage
  - [ ] Singleton pattern (static getInstance())
  - [ ] Private constructor
  - [ ] Implement get<T>(key): Promise<T | null>
    - [ ] Check if exists and not expired
    - [ ] Return null if expired
  - [ ] Implement set<T>(key, value, ttlMinutes = 15): Promise<void>
    - [ ] Store with expiration timestamp
  - [ ] Implement invalidate(key): Promise<void>
  - [ ] Implement clear(): Promise<void>
  - [ ] Add cache statistics tracking (hits/misses)
  - [ ] Create CacheEntry interface internally
- [ ] Write unit tests
  - [ ] Test cache storage and retrieval
  - [ ] Test TTL expiration (use fake timers)
  - [ ] Test manual invalidation
  - [ ] Test cache miss scenarios
  - [ ] Test statistics tracking
- [ ] VERIFY: Provider implements ICacheProvider completely
- [ ] VERIFY: Singleton pattern works correctly
- [ ] Commit: "💾 Implement in-memory cache provider adapter"

### Step 3.3: Implement Auth Provider and Configuration (Infrastructure)
- [ ] Create `src/infrastructure/config/env.ts`
  - [ ] EnvironmentConfig class with static getters:
    - [ ] GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
    - [ ] NEXTAUTH_URL, NEXTAUTH_SECRET
    - [ ] GITHUB_TOKEN, GITHUB_ORG
    - [ ] WORKFLOW_NAME (default: "Build and Push to ECR")
  - [ ] static validate() method - throw if required vars missing
  - [ ] Add clear error messages
- [ ] Create `src/infrastructure/adapters/auth/NextAuthProvider.ts`
  - [ ] Implements IAuthProvider interface
  - [ ] async getCurrentUser(): Promise<User | null>
    - [ ] Use getServerSession from next-auth
  - [ ] validateDomain(email, allowedDomain): boolean
    - [ ] Check email ends with @domain
- [ ] Create `src/infrastructure/lib/logger.ts`
  - [ ] ConsoleLogger class implements ILogger
  - [ ] Implement debug, info, warn, error methods
  - [ ] Add timestamps
  - [ ] Format logs consistently
  - [ ] Respect environment (suppress debug in production)
- [ ] Create `src/infrastructure/lib/errors.ts`
  - [ ] Custom error classes:
    - [ ] GitHubApiError
    - [ ] RateLimitError
    - [ ] AuthenticationError
    - [ ] RepositoryNotFoundError
  - [ ] Include status codes and helpful messages
  - [ ] Include retry information
- [ ] Create `src/infrastructure/config/index.ts` for exports
- [ ] Create `src/infrastructure/lib/index.ts` for exports
- [ ] VERIFY: All adapters implement their respective interfaces
- [ ] Commit: "⚙️ Add configuration and infrastructure utilities"

---

## Phase 4: Next.js Integration - Authentication & API Routes (Thin Controllers)

### Step 4.1: Configure NextAuth.js with Dependency Injection
- [ ] Create `app/api/auth/[...nextauth]/route.ts`
  - [ ] Import EnvironmentConfig for credentials
  - [ ] Set up Google OAuth provider
  - [ ] Add callback to validate email domain
  - [ ] Use NextAuthProvider.validateDomain() for @qomodo.me restriction
  - [ ] Configure session and JWT callbacks
  - [ ] Include user email in session
- [ ] Update `app/layout.tsx`
  - [ ] Wrap app with SessionProvider
  - [ ] Use Suspense for loading state
- [ ] Create `app/page.tsx` (temporary test page)
  - [ ] Show "Sign in with Google" button if not authenticated
  - [ ] Show user info and logout button if authenticated
- [ ] Test authentication flow
  - [ ] Login with @qomodo.me email (should work)
  - [ ] Login with other domain (should fail)
  - [ ] Session persists across reloads
  - [ ] Logout works correctly
- [ ] VERIFY: Uses NextAuthProvider (infrastructure adapter)
- [ ] VERIFY: Domain restriction works
- [ ] Commit: "🔐 Configure NextAuth with domain restriction"

### Step 4.2: Create Protected Route Components
- [ ] Create `components/providers/AuthProvider.tsx`
  - [ ] Client component wrapping SessionProvider
  - [ ] Handle authentication state
  - [ ] Show loading state while checking auth
- [ ] Create `components/ProtectedRoute.tsx`
  - [ ] Client component that checks authentication
  - [ ] Redirect to login if not authenticated
  - [ ] Show loading spinner during check
  - [ ] Accept children to render when authenticated
- [ ] Create test protected page `app/test-protected/page.tsx`
  - [ ] Use ProtectedRoute component
  - [ ] Display user session info
- [ ] Write component tests
  - [ ] Test redirect when not authenticated
  - [ ] Test no flash of protected content
  - [ ] Test renders children when authenticated
- [ ] VERIFY: Protected routes work correctly
- [ ] Commit: "🛡️ Add protected route components"

---

## Phase 5: API Routes with Dependency Injection

### Step 5.1: Create Repository Data API Endpoint
- [ ] Create `app/api/repositories/route.ts`
  - [ ] Implement GET handler with dependency injection
  - [ ] 1. Validate authentication:
    - [ ] Create NextAuthProvider instance
    - [ ] Call getCurrentUser()
    - [ ] Return 401 if not authenticated
  - [ ] 2. Create infrastructure adapters:
    - [ ] OctokitClient with EnvironmentConfig.GITHUB_TOKEN
    - [ ] GitHubRepositoryProvider with octokit and org name
    - [ ] InMemoryCacheProvider.getInstance()
    - [ ] ConsoleLogger instance
  - [ ] 3. Create use cases with dependency injection:
    - [ ] FetchRepositoryData(repositoryProvider, logger)
    - [ ] FetchOrganizationData(repositoryProvider, cacheProvider, fetchRepositoryData, logger)
  - [ ] 4. Execute use case:
    - [ ] Parse refresh query parameter
    - [ ] Call fetchOrgData.execute({ orgName, forceRefresh, workflowName })
  - [ ] 5. Return JSON response:
    - [ ] { repositories, stats, lastUpdated }
  - [ ] Add comprehensive error handling
    - [ ] Catch and log errors
    - [ ] Return appropriate HTTP status codes
    - [ ] Return cached data on error if available
    - [ ] Don't expose sensitive information
- [ ] Write API route tests
  - [ ] Mock NextAuthProvider (test auth required)
  - [ ] Mock use cases
  - [ ] Test authenticated request success
  - [ ] Test unauthenticated request (401)
  - [ ] Test cache hit scenario
  - [ ] Test cache miss scenario
  - [ ] Test refresh parameter
  - [ ] Test error scenarios
  - [ ] Verify response structure
- [ ] VERIFY: All layers connected via dependency injection
- [ ] VERIFY: No tight coupling to concrete implementations in use cases
- [ ] Commit: "🔌 Wire up API endpoint with dependency injection"

### Step 5.2: Add Health Check Endpoint
- [ ] Create `app/api/health/route.ts`
  - [ ] Check GitHub API connectivity
  - [ ] Check cache functionality
  - [ ] Return status: healthy/degraded/unhealthy
  - [ ] Include timestamp and version info
- [ ] Write tests for health check
  - [ ] Test healthy status
  - [ ] Test degraded status
  - [ ] Test unhealthy status
- [ ] Commit: "🏥 Add health check endpoint"

---

## Phase 6: Frontend - Layout and Dashboard Shell (Presentation Layer)

### Step 6.1: Create Dashboard Layout with Header
- [ ] Create `/components/layout/Header.tsx`
- [ ] Add dashboard title
- [ ] Add organization name display
- [ ] Add user profile section with email
- [ ] Add logout button
- [ ] Add manual refresh button (placeholder)
- [ ] Add last updated timestamp display
- [ ] Style with Tailwind CSS
- [ ] Create `/components/layout/DashboardLayout.tsx`
- [ ] Add Header component
- [ ] Add main content area with spacing
- [ ] Add loading state support
- [ ] Add error state support
- [ ] Create `/app/dashboard/page.tsx`
- [ ] Wrap with ProtectedRoute
- [ ] Use DashboardLayout
- [ ] Add placeholder content
- [ ] Fetch user session for Header
- [ ] Update `/app/page.tsx`
- [ ] Add authentication check
- [ ] Redirect to dashboard if authenticated
- [ ] Show login page if not authenticated
- [ ] Add "Sign in with Google" button
- [ ] Create component tests
- [ ] Test Header renders user info
- [ ] Test logout button
- [ ] Test DashboardLayout renders children
- [ ] Test redirect logic
- [ ] VERIFY: Components consume API (application layer), don't call domain directly
- [ ] Commit: "🎨 Add dashboard layout and header"

### Step 6.2: Create Organization Statistics Summary Bar
- [ ] Create `/components/dashboard/StatsSummary.tsx`
- [ ] Display total repositories metric
- [ ] Display releases this month metric
- [ ] Display avg build success rate metric
- [ ] Use card/panel styling with Tailwind
- [ ] Create 3-column desktop layout
- [ ] Add loading skeleton state
- [ ] Create `/components/ui/StatCard.tsx`
- [ ] Add props: label, value, icon, format
- [ ] Implement number formatting
- [ ] Implement percentage formatting
- [ ] Add clean typography and spacing
- [ ] Create `/components/ui/Skeleton.tsx`
- [ ] Add animated pulse effect
- [ ] Make it reusable for various components
- [ ] Update `/app/dashboard/page.tsx`
- [ ] Fetch data from /api/repositories
- [ ] Pass organization stats to StatsSummary
- [ ] Show loading state while fetching
- [ ] Handle error state
- [ ] Create component tests
- [ ] Test StatsSummary renders all metrics
- [ ] Test StatCard formatting
- [ ] Test loading skeleton
- [ ] VERIFY: StatsSummary displays data from OrganizationStats (domain model)
- [ ] Commit: "📊 Add organization statistics summary"

### Step 6.3: Create Search and Filter Bar
- [ ] Create `/components/dashboard/SearchBar.tsx`
- [ ] Add text input for searching
- [ ] Implement real-time filtering
- [ ] Add clear button (X) when text entered
- [ ] Add placeholder text
- [ ] Add onChange callback
- [ ] Style with Tailwind (focus states)
- [ ] Create `/hooks/useRepositoryFilter.ts`
- [ ] Implement filtering logic
- [ ] Implement case-insensitive search
- [ ] Implement sorting by releases in last 30 days
- [ ] Add memoization with useMemo
- [ ] Create `/hooks/useDebounce.ts`
- [ ] Implement 300ms debounce
- [ ] Update `/app/dashboard/page.tsx`
- [ ] Add SearchBar component
- [ ] Add search state management
- [ ] Use useRepositoryFilter hook
- [ ] Show "No repositories found" when empty
- [ ] Create tests
- [ ] Test SearchBar renders and accepts input
- [ ] Test useRepositoryFilter with various searches
- [ ] Test sorting logic
- [ ] Test debouncing behavior
- [ ] Test empty results handling
- [ ] VERIFY: Client-side filtering only, no business logic duplication
- [ ] Commit: "🔍 Add search and filter functionality"

---

## Phase 7: Frontend - Repository Cards (Presentation Layer)

### Step 7.1: Create Repository Card Shell
- [ ] Create `/components/dashboard/RepositoryCard.tsx`
- [ ] Add card container with hover effect
- [ ] Add click handler to open GitHub URL
- [ ] Add card header with repository name
- [ ] Add chart placeholder section
- [ ] Add release info section
- [ ] Add build stats section
- [ ] Add activity metrics section
- [ ] Add repository metrics section
- [ ] Style with Tailwind (shadow, rounded, padding)
- [ ] Create `/components/dashboard/MetricRow.tsx`
- [ ] Add label and value display
- [ ] Support multiple formats (string, number, %, date)
- [ ] Create `/components/dashboard/MetricSection.tsx`
- [ ] Add section wrapper with heading
- [ ] Container for multiple MetricRow components
- [ ] Create `/lib/utils/formatters.ts`
- [ ] Implement formatNumber() - add commas
- [ ] Implement formatPercentage() - add %
- [ ] Implement formatDate() - human readable
- [ ] Implement formatDaysAgo() - "X days ago"
- [ ] Implement formatCodeChurn() - "+X / -Y"
- [ ] Update `/app/dashboard/page.tsx`
- [ ] Create CSS Grid layout for cards
- [ ] Map over filtered repositories
- [ ] Render RepositoryCard for each
- [ ] Set 3-4 cards per row
- [ ] Create tests
- [ ] Test RepositoryCard renders all sections
- [ ] Test click handler opens correct URL
- [ ] Test metric formatting functions
- [ ] Test grid layout with multiple cards
- [ ] VERIFY: Cards display Repository domain model data
- [ ] VERIFY: Formatting utilities are pure functions
- [ ] Commit: "🗂️ Add repository card component"

### Step 7.2: Integrate Chart.js for Release History
- [ ] Verify chart.js and react-chartjs-2 are installed
- [ ] Create `/lib/chart/config.ts`
- [ ] Add responsive configuration
- [ ] Add clean, minimal styling
- [ ] Configure color scheme
- [ ] Disable legends
- [ ] Configure tooltips
- [ ] Create `/components/charts/ReleaseChart.tsx`
- [ ] Create bar chart component
- [ ] Add props for monthlyBreakdown
- [ ] Configure X-axis with month labels
- [ ] Configure Y-axis for release count
- [ ] Set chart height (~200px)
- [ ] Handle empty data case
- [ ] Add React.memo for performance
- [ ] Create `/lib/chart/transforms.ts`
- [ ] Implement transformMonthlyReleases()
- [ ] Convert to Chart.js format
- [ ] Generate last 12 months labels
- [ ] Fill missing months with 0
- [ ] Update RepositoryCard
- [ ] Replace chart placeholder with ReleaseChart
- [ ] Pass monthlyBreakdown data
- [ ] Show "No releases" for empty data
- [ ] Add lazy loading with next/dynamic
- [ ] Show skeleton while chart loads
- [ ] Create tests
- [ ] Test ReleaseChart renders with data
- [ ] Test empty data scenario
- [ ] Test data transformation
- [ ] Test chart configuration
- [ ] Add snapshot test
- [ ] VERIFY: Chart consumes MonthlyRelease[] from domain model
- [ ] Commit: "📈 Integrate Chart.js for release charts"

### Step 7.3: Add Loading and Error States to Dashboard
- [ ] Create `/components/ui/CardSkeleton.tsx`
- [ ] Match RepositoryCard layout
- [ ] Add animated pulse effect
- [ ] Set same dimensions as actual card
- [ ] Create `/components/ui/ErrorMessage.tsx`
- [ ] Add error icon
- [ ] Add message display
- [ ] Add optional retry button
- [ ] Style with clean, non-alarming design
- [ ] Update `/app/dashboard/page.tsx`
- [ ] Add loading state management
- [ ] Add error state management
- [ ] Show grid of CardSkeletons while loading (6-8)
- [ ] Show ErrorMessage on fetch failure
- [ ] Implement retry functionality
- [ ] Show stale data with warning on refresh failure
- [ ] Create `/components/ErrorBoundary.tsx`
- [ ] Catch React rendering errors
- [ ] Show fallback UI
- [ ] Log errors to console
- [ ] Wrap dashboard in error boundary
- [ ] Create `/components/ui/Toast.tsx`
- [ ] Add auto-dismiss (3 seconds)
- [ ] Add success and error variants
- [ ] Position at top-right corner
- [ ] Add show/hide animations
- [ ] Create tests
- [ ] Test loading skeletons appear
- [ ] Test error messages display
- [ ] Test retry button works
- [ ] Test error boundary catches errors
- [ ] Test toast notifications
- [ ] VERIFY: Error handling at presentation layer only (no business logic)
- [ ] Commit: "⏳ Add loading and error states"

---

## Phase 8: Manual Refresh Functionality (UI → Use Case Integration)

### Step 8.1: Implement Manual Refresh with Cache Invalidation
- [ ] Update `/components/layout/Header.tsx`
- [ ] Make refresh button functional
- [ ] Add loading spinner when refreshing
- [ ] Disable button during refresh
- [ ] Add onRefresh callback prop
- [ ] Add isRefreshing boolean prop
- [ ] Add keyboard shortcut support (Cmd/Ctrl + R)
- [ ] Create `/hooks/useRepositoryData.ts`
- [ ] Manage loading state
- [ ] Manage error state
- [ ] Implement fetchData() for initial fetch
- [ ] Implement refresh() with cache bypass
- [ ] Call /api/repositories with refresh parameter
- [ ] Return data, stats, loading, error, lastUpdated, refresh
- [ ] Create `/lib/utils/time.ts`
- [ ] Implement formatTimeAgo() - "X minutes ago"
- [ ] Handle "just now" case
- [ ] Create `/hooks/useKeyboardShortcut.ts`
- [ ] Listen for Cmd/Ctrl + R
- [ ] Prevent default browser refresh
- [ ] Trigger data refresh
- [ ] Update `/app/dashboard/page.tsx`
- [ ] Use useRepositoryData hook
- [ ] Pass refresh function to Header
- [ ] Pass isRefreshing state to Header
- [ ] Update lastUpdated display
- [ ] Show toast on successful refresh
- [ ] Show toast on refresh error
- [ ] Create tests
- [ ] Test useRepositoryData hook
- [ ] Test initial fetch
- [ ] Test refresh with cache bypass
- [ ] Test error handling
- [ ] Test keyboard shortcut
- [ ] VERIFY: Refresh triggers use case execution via API endpoint
- [ ] VERIFY: Cache invalidation happens at infrastructure layer
- [ ] Commit: "🔄 Add manual refresh functionality"

---

## Phase 9: Polish and Refinement (All Layers)

### Step 9.1: Add Sorting and Additional UI Polish
- [ ] Update `/hooks/useRepositoryFilter.ts`
- [ ] Verify sorting by releases in last 30 days
- [ ] Add secondary sort by repository name
- [ ] Handle ties properly
- [ ] Create `/components/dashboard/EmptyState.tsx`
- [ ] Show when no repositories
- [ ] Add appropriate icon and message
- [ ] Different messages for "no results" vs "no repos"
- [ ] Add repository count display
- [ ] Show "Showing X repositories" below search
- [ ] Update when search filters results
- [ ] Format: "Showing X of Y repositories"
- [ ] Enhance card interactions
- [ ] Add subtle scale on hover
- [ ] Add focus states for accessibility
- [ ] Ensure pointer cursor
- [ ] Add transition animations
- [ ] Improve responsive behavior
- [ ] Test grid on 1366x768 screens
- [ ] Adjust card padding for smaller screens
- [ ] Ensure readable text at all sizes
- [ ] Add performance optimizations
- [ ] Implement virtualization if > 50 repos
- [ ] Add React.memo to appropriate components
- [ ] Verify no unnecessary re-renders
- [ ] Test with 100+ mock repos
- [ ] Add accessibility improvements
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators
- [ ] Test with screen reader (basic)
- [ ] Run axe DevTools
- [ ] VERIFY: No business logic leaked into presentation layer
- [ ] VERIFY: Sorting logic uses domain services if complex
- [ ] Commit: "✨ Add UI polish and accessibility"

### Step 9.2: Add Comprehensive Error Handling and Logging (All Layers)
- [ ] Enhance `src/infrastructure/lib/logger.ts`
- [ ] Add log levels (debug, info, warn, error)
- [ ] Add context object support
- [ ] Format logs consistently
- [ ] Include timestamps
- [ ] Add environment check (suppress debug in prod)
- [ ] Add error tracking points throughout app
- [ ] Track GitHub API errors with retry count
- [ ] Track cache errors
- [ ] Track authentication errors
- [ ] Track component render errors
- [ ] Track network errors
- [ ] Enhance `src/infrastructure/lib/errors.ts`
- [ ] Create GitHubApiError class
- [ ] Create RateLimitError class
- [ ] Create AuthenticationError class
- [ ] Create RepositoryNotFoundError class
- [ ] Include status codes and messages
- [ ] Include retry information
- [ ] Update error handling in API routes
- [ ] Use custom error classes
- [ ] Log all errors with context
- [ ] Return appropriate HTTP status codes
- [ ] Include helpful error messages
- [ ] Don't expose sensitive info
- [ ] Add client-side error logging
- [ ] Log errors to console in development
- [ ] Prepare stub for error tracking service
- [ ] Include user context (email, session)
- [ ] Include component stack traces
- [ ] Verify `app/api/health/route.ts` works correctly
- [ ] Check GitHub API connectivity
- [ ] Check cache functionality
- [ ] Return healthy/degraded/unhealthy status
- [ ] Create comprehensive tests
- [ ] Test error classes
- [ ] Test error handling in API routes
- [ ] Test error logging
- [ ] Test health check endpoint
- [ ] VERIFY: Domain layer never logs directly (uses ILogger port if needed)
- [ ] VERIFY: Error handling at appropriate layers (domain throws, infrastructure catches)
- [ ] Commit: "🐛 Add comprehensive error handling and logging"

---

## Phase 10: Testing and Quality Assurance (All Layers)

### Step 10.1: Add End-to-End Tests
- [ ] Install @playwright/test
- [ ] Create playwright.config.ts
- [ ] Set up test environment with mock data
- [ ] Create test utilities and helpers
- [ ] Create `/e2e/auth.spec.ts`
- [ ] Test login flow with Google OAuth (mock)
- [ ] Test domain restriction (@qomodo.me)
- [ ] Test logout flow
- [ ] Test redirect after login
- [ ] Test protected route access
- [ ] Create `/e2e/dashboard.spec.ts`
- [ ] Test dashboard loads successfully
- [ ] Test organization stats display
- [ ] Test repository cards render
- [ ] Test search functionality
- [ ] Test manual refresh button
- [ ] Test card click opens GitHub
- [ ] Test keyboard shortcuts
- [ ] Create `/e2e/data-flow.spec.ts`
- [ ] Test complete data flow from API to UI
- [ ] Test caching behavior
- [ ] Test cache expiration (mock time)
- [ ] Test error handling
- [ ] Test empty states
- [ ] Create `/e2e/fixtures/mock-repos.ts`
- [ ] Mock GitHub API responses
- [ ] Include repos with many releases
- [ ] Include repos with no releases
- [ ] Include repos with high/low build success
- [ ] Include repos with various activity levels
- [ ] Add visual regression tests
- [ ] Take screenshots of key pages
- [ ] Compare against baseline
- [ ] Test login page, dashboard, cards
- [ ] Run all E2E tests and verify they pass
- [ ] VERIFY: E2E tests validate complete flow through all layers
- [ ] VERIFY: Domain tests remain pure (no mocking)
- [ ] VERIFY: Use case tests mock only ports
- [ ] VERIFY: Infrastructure tests mock only external APIs
- [ ] Commit: "🧪 Add end-to-end tests"

### Step 10.2: Performance Testing and Optimization
- [ ] Create `/tests/performance/dashboard.perf.ts`
- [ ] Test with 10 repositories
- [ ] Test with 50 repositories
- [ ] Test with 100 repositories
- [ ] Measure initial page load time
- [ ] Measure time to interactive
- [ ] Measure API response time
- [ ] Measure chart render time
- [ ] Measure search filter performance
- [ ] Create `/lib/monitoring/performance.ts`
- [ ] Track API call duration
- [ ] Track component render time
- [ ] Track cache hit/miss rate
- [ ] Log slow operations (> 1s)
- [ ] Optimize based on findings
- [ ] Add React.memo to expensive components
- [ ] Optimize chart rendering
- [ ] Optimize search filtering
- [ ] Reduce re-renders with proper dependencies
- [ ] Add request coalescing if needed
- [ ] Analyze bundle size
- [ ] Check for duplicate dependencies
- [ ] Verify code splitting works
- [ ] Check Chart.js bundle impact
- [ ] Ensure tree shaking is effective
- [ ] Create performance budget document
- [ ] Set API response < 3s threshold
- [ ] Set page load < 2s threshold
- [ ] Set search filter < 100ms threshold
- [ ] Set chart render < 500ms threshold
- [ ] Add tests to enforce budgets
- [ ] Load test with 100+ repositories
- [ ] Test concurrent user access
- [ ] Test cache effectiveness
- [ ] Verify no memory leaks
- [ ] Run all performance tests
- [ ] VERIFY: Performance bottlenecks identified by layer
- [ ] VERIFY: Domain layer performance (pure functions should be fast)
- [ ] VERIFY: Infrastructure layer performance (API calls, caching)
- [ ] Commit: "⚡ Add performance testing and optimizations"

---

## Phase 11: Docker and Deployment

### Step 11.1: Create Docker Configuration
- [ ] Create Dockerfile
- [ ] Add multi-stage build
- [ ] Stage 1: Dependencies (npm ci)
- [ ] Stage 2: Build (npm run build)
- [ ] Stage 3: Production (minimal image)
- [ ] Use node:18-alpine base image
- [ ] Expose port 3000
- [ ] Add health check configuration
- [ ] Use non-root user for security
- [ ] Create .dockerignore
- [ ] Exclude node_modules
- [ ] Exclude .git
- [ ] Exclude .env.local
- [ ] Exclude test files
- [ ] Exclude documentation
- [ ] Create docker-compose.yml
- [ ] Add service definition
- [ ] Add port mapping (3000:3000)
- [ ] Add environment variable file reference
- [ ] Add restart policy
- [ ] Add health check
- [ ] Create .env.production.example
- [ ] List all required variables
- [ ] Add instructions in comments
- [ ] No default values (security)
- [ ] Update README.md
- [ ] Add Docker build instructions
- [ ] Add Docker run instructions
- [ ] Add docker-compose instructions
- [ ] Document environment variables
- [ ] Add troubleshooting section
- [ ] Test Docker build locally
- [ ] Build image
- [ ] Run container
- [ ] Verify application works
- [ ] Test with production-like env vars
- [ ] Check health endpoint
- [ ] Verify logs are visible
- [ ] Add build scripts to package.json
- [ ] Add "docker:build" script
- [ ] Add "docker:run" script
- [ ] Add "docker:stop" script
- [ ] Verify Docker image size (< 200MB target)
- [ ] Commit: "🐳 Add Docker configuration"

### Step 11.2: Add Production Optimizations
- [ ] Update next.config.js
- [ ] Enable production optimizations
- [ ] Configure output: 'standalone' for Docker
- [ ] Add security headers
- [ ] Configure compression
- [ ] Add environment variable validation
- [ ] Add security headers
- [ ] Add Content Security Policy (CSP)
- [ ] Add X-Frame-Options
- [ ] Add X-Content-Type-Options
- [ ] Add Referrer-Policy
- [ ] Add Permissions-Policy
- [ ] Create `/scripts/startup.sh`
- [ ] Validate environment variables
- [ ] Start application
- [ ] Make executable (chmod +x)
- [ ] Add graceful shutdown
- [ ] Handle SIGTERM
- [ ] Handle SIGINT
- [ ] Finish in-flight requests
- [ ] Clean up resources
- [ ] Configure logging for production
- [ ] Write to stdout/stderr
- [ ] Add structured logging (JSON format)
- [ ] Include request IDs
- [ ] Add log rotation considerations
- [ ] Create `/app/api/metrics/route.ts`
- [ ] Expose uptime metric
- [ ] Expose memory usage metric
- [ ] Expose cache statistics
- [ ] Expose request count
- [ ] Protect with API key
- [ ] Create DEPLOYMENT.md
- [ ] Add pre-deployment checklist
- [ ] Add post-deployment verification steps
- [ ] Add rollback procedure
- [ ] Add monitoring setup instructions
- [ ] Update README.md
- [ ] Add architecture diagram
- [ ] Document all environment variables
- [ ] Add troubleshooting guide
- [ ] Add API documentation
- [ ] Test graceful shutdown
- [ ] Verify security headers are set
- [ ] Test health checks work
- [ ] Test metrics endpoint
- [ ] VERIFY: Environment validation uses EnvironmentConfig
- [ ] Commit: "🚀 Add production optimizations"

---

## Phase 12: Final Testing and Documentation

### Step 12.1: Comprehensive Testing Pass
- [ ] Create TESTING.md
- [ ] List all features from spec
- [ ] Create manual test cases for each
- [ ] Include edge cases and error scenarios
- [ ] Manual testing session - Authentication
- [ ] Test complete authentication flow
- [ ] Test with @qomodo.me email (success)
- [ ] Test with other domain (failure)
- [ ] Test logout
- [ ] Test session persistence
- [ ] Manual testing session - Dashboard Features
- [ ] Test organization stats display
- [ ] Test repository cards and all metrics
- [ ] Test charts with various data sets
- [ ] Test search functionality
- [ ] Test manual refresh
- [ ] Test keyboard shortcuts (Cmd/Ctrl + R)
- [ ] Manual testing session - Error Scenarios
- [ ] Test with no GitHub token
- [ ] Test with invalid token
- [ ] Test when GitHub API is down
- [ ] Test network errors
- [ ] Test repositories without workflows
- [ ] Manual testing session - Data Scenarios
- [ ] Test empty organization (no repos)
- [ ] Test small organization (< 10 repos)
- [ ] Test medium organization (10-50 repos)
- [ ] Test large organization (50+ repos)
- [ ] Test repositories with no releases
- [ ] Test repositories with no builds
- [ ] Test repositories with failing builds
- [ ] Accessibility testing
- [ ] Run axe DevTools (no critical issues)
- [ ] Test keyboard navigation
- [ ] Test with screen reader (basic)
- [ ] Verify ARIA labels
- [ ] Check color contrast
- [ ] Test with browser zoom (150%, 200%)
- [ ] Browser compatibility testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Document any browser-specific issues
- [ ] Security testing
- [ ] Verify GitHub token never exposed to client
- [ ] Verify domain restriction works
- [ ] Test authentication bypass attempts
- [ ] Check for XSS vulnerabilities
- [ ] Verify CSP headers are set
- [ ] Performance testing
- [ ] Test initial load time (< 2s target)
- [ ] Test time to interactive
- [ ] Test refresh performance
- [ ] Monitor memory usage over time
- [ ] Check for memory leaks
- [ ] Create KNOWN_ISSUES.md
- [ ] List any limitations
- [ ] List future improvements
- [ ] Note any workarounds
- [ ] VERIFY: All requirements from spec.md met
- [ ] VERIFY: Hexagonal architecture principles maintained throughout
- [ ] Commit: "✅ Complete comprehensive testing"

### Step 12.2: Final Documentation and Handoff
- [ ] Update README.md
- [ ] Add project overview
- [ ] Add features list
- [ ] Add screenshots (optional but helpful)
- [ ] Add quick start guide
- [ ] Add development setup instructions
- [ ] Add testing instructions
- [ ] Add deployment instructions
- [ ] Add contributing guidelines (if applicable)
- [ ] Create ARCHITECTURE.md
- [ ] Add system architecture diagram
- [ ] Document component structure
- [ ] Add data flow diagram
- [ ] Document authentication flow
- [ ] Document caching strategy
- [ ] Document API structure
- [ ] List technology stack with versions
- [ ] Update DEPLOYMENT.md
- [ ] Add prerequisites
- [ ] Document all environment variables
- [ ] Add Docker deployment steps
- [ ] Add manual deployment steps (alternative)
- [ ] Add Google OAuth setup instructions
- [ ] Add GitHub token creation instructions
- [ ] Add SSL/TLS setup
- [ ] Add monitoring setup
- [ ] Add backup strategy (if applicable)
- [ ] Create MAINTENANCE.md
- [ ] Add regular maintenance tasks
- [ ] Add log monitoring instructions
- [ ] Add performance monitoring guide
- [ ] Add security update procedures
- [ ] Add dependency update procedures
- [ ] Add troubleshooting guide
- [ ] Add common issues and solutions
- [ ] Create API.md
- [ ] Document all API endpoints
- [ ] Document request/response formats
- [ ] Document authentication requirements
- [ ] Document error responses
- [ ] Document rate limiting (if applicable)
- [ ] Create CHANGELOG.md
- [ ] Add initial release notes (v1.0.0)
- [ ] List all features
- [ ] List known limitations
- [ ] Create CONTRIBUTING.md (if applicable)
- [ ] Add development setup
- [ ] Add code style guidelines
- [ ] Add testing requirements
- [ ] Add pull request process
- [ ] Review inline code documentation
- [ ] Review JSDoc comments on all functions
- [ ] Document complex logic
- [ ] Add examples where helpful
- [ ] Create DEVELOPMENT.md
- [ ] Add local development setup
- [ ] Add running tests instructions
- [ ] Document code structure
- [ ] Add instructions for adding new features
- [ ] Add debugging tips
- [ ] Final review
- [ ] Verify all documentation is accurate
- [ ] Check all links are valid
- [ ] Ensure instructions are easy to follow
- [ ] Test setup from scratch with docs
  - [ ] Verify hexagonal architecture is well documented
  - [ ] Verify layer boundaries are clear in code
- [ ] Commit: "📚 Complete final documentation"

---

## Hexagonal Architecture - Final Verification Checklist

Before considering the project complete, verify these architectural principles:

### ✅ Domain Layer (src/domain/)
- [ ] NO imports from Next.js, React, Octokit, or any framework
- [ ] All models are pure TypeScript classes/interfaces
- [ ] All services are pure static functions (deterministic)
- [ ] Domain tests require NO mocking (pure unit tests)
- [ ] Business logic is framework-agnostic
- [ ] Can be extracted and used in any other project

### ✅ Use Case Layer (src/usecase/)
- [ ] Depends ONLY on domain ports (interfaces)
- [ ] NO concrete infrastructure implementations imported
- [ ] Tests use mocked ports only
- [ ] Orchestrates domain logic without business rules
- [ ] Can be reused across different interfaces (API, CLI, etc.)

### ✅ Infrastructure Layer (src/infrastructure/)
- [ ] Implements all domain ports
- [ ] Adapters convert external DTOs to domain models
- [ ] All framework-specific code is here (Octokit, Next.js utilities)
- [ ] Integration tests mock external APIs, not domain

### ✅ API Routes (app/api/)
- [ ] Thin controllers with dependency injection
- [ ] Wire up adapters and use cases
- [ ] NO business logic in routes
- [ ] Handle HTTP concerns only (auth, status codes, JSON)

### ✅ Presentation Layer (components/)
- [ ] Components consume API endpoints
- [ ] Display domain model data
- [ ] NO business logic in components
- [ ] Formatting is presentational, not business logic

### ✅ Dependency Flow
- [ ] Dependencies point inward: Infrastructure → Use Cases → Domain
- [ ] Domain knows nothing about infrastructure
- [ ] Use cases don't know about HTTP, Next.js, or Octokit
- [ ] Easy to swap implementations (e.g., GitHub → GitLab)
- [ ] Can test business logic without any framework

---

## Project Completion Checklist

- [ ] All phases complete
- [ ] All tests passing
- [ ] Docker image builds successfully
- [ ] Application runs in Docker container
- [ ] All documentation complete and accurate
- [ ] Performance meets requirements
- [ ] Security requirements met
- [ ] Accessibility standards met
- [ ] Code is well-commented
- [ ] No critical bugs or issues
- [ ] Project ready for handoff/deployment

---

## Notes

**Architecture:** Hexagonal Architecture (Ports and Adapters)  
**Estimated Total Time:** 7-11 days for experienced Next.js developer  
**Key Principle:** Domain-first development with dependency inversion

**Folder Structure:**
```
src/
├── domain/          # Pure business logic (NO framework dependencies)
│   ├── models/      # Business entities
│   ├── ports/       # Interfaces (contracts)
│   └── services/    # Pure calculations
├── usecase/         # Application orchestration
└── infrastructure/  # Framework & external dependencies
    ├── adapters/    # Implementations of ports
    ├── config/      # Environment & configuration
    └── lib/         # Framework utilities
```

**Progress Tracking:**
- Update "Current Phase" at the top of this document
- Check off items as completed
- Add notes below for any blockers or deviations

**Architecture Guidelines:**
- ❌ Never import framework code into domain layer
- ✅ Always use dependency injection in use cases
- ✅ Test domain with pure unit tests (no mocking)
- ✅ Test use cases with mocked ports
- ✅ Keep controllers thin (wire dependencies only)

**Blockers/Issues:**
- _Add any blockers or issues here as they arise_

**Deviations from Plan:**
- _Document any changes from the original plan_
- _Especially note any violations of hexagonal principles_

---

**Project Status:** ☐ Not Started | ☐ In Progress | ☐ Complete  
**Last Updated:** _________________
