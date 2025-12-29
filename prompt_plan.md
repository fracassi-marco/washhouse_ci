# CI Dashboard - Implementation Plan & Prompts

## Overview

This document provides a systematic, step-by-step implementation plan for building the CI Dashboard. Each prompt is designed to be executed sequentially, building on the previous work in a test-driven, incremental manner.

**Key Principles:**
- Test-driven development (TDD) where applicable
- Incremental progress with frequent integration
- No orphaned or unused code
- Each step builds on and integrates with previous steps
- Clear success criteria for each step

---

## Phase 1: Project Foundation & Setup

### Step 1.1: Initialize Next.js Project with TypeScript and Tailwind

**Context:** Starting from scratch, we need a solid foundation with all core dependencies.

**Prompt:**
```
Create a new Next.js 14+ project with the App Router, TypeScript, and Tailwind CSS. Set up the project with the following requirements:

1. Initialize the project using create-next-app with these flags:
   - TypeScript enabled
   - Tailwind CSS enabled
   - App Router (not Pages Router)
   - No src/ directory
   - Use npm as package manager

2. Install these additional dependencies:
   - next-auth (latest version)
   - @octokit/rest
   - chart.js
   - react-chartjs-2

3. Create a basic project structure:
   - /app (already exists)
   - /lib (for utility functions and services)
   - /types (for TypeScript interfaces)
   - /components (for React components)

4. Set up a .env.local.example file with placeholders for:
   - GOOGLE_CLIENT_ID=
   - GOOGLE_CLIENT_SECRET=
   - NEXTAUTH_URL=http://localhost:3000
   - NEXTAUTH_SECRET=
   - GITHUB_TOKEN=
   - GITHUB_ORG=

5. Add a .gitignore entry for .env.local

6. Create a README.md with setup instructions

7. Verify the setup by running the dev server and accessing the default Next.js page

Success criteria:
- Project runs without errors on http://localhost:3000
- All dependencies are installed
- Directory structure is created
- Environment variable template exists
```

---

### Step 1.2: Define Core TypeScript Types

**Context:** Before building features, we need type safety with well-defined interfaces based on the spec.

**Prompt:**
```
Create a comprehensive TypeScript types file that defines all data structures for the CI Dashboard. Reference the spec document for exact requirements.

1. Create /types/dashboard.ts with the following interfaces:

   a. MonthlyRelease interface for chart data
   b. RepositoryData interface with all metrics (releases, builds, activity, contributors, commitFrequency)
   c. OrganizationStats interface for dashboard-level statistics
   d. CacheEntry interface for the caching layer

2. Add JSDoc comments to each interface explaining its purpose

3. Export all types from /types/index.ts for easy importing

4. Create a simple test file /types/__tests__/dashboard.test.ts that verifies:
   - Types can be imported successfully
   - Sample objects can be created matching each interface

Success criteria:
- All types are properly defined according to spec
- Types include proper nullable fields (e.g., lastReleaseDate can be null)
- Test file runs successfully with npm test
- No TypeScript errors when importing types
```

---

## Phase 2: Authentication Setup

### Step 2.1: Configure NextAuth.js with Google OAuth

**Context:** Implement authentication before any protected routes. Users must authenticate with Google.

**Prompt:**
```
Implement NextAuth.js authentication with Google OAuth and domain restriction. This is a critical security feature.

1. Create /app/api/auth/[...nextauth]/route.ts with NextAuth configuration:
   - Set up Google OAuth provider
   - Configure callbacks to check email domain
   - Use environment variables for credentials

2. Add session and JWT callbacks to include user email in the session

3. Create /lib/auth.ts with helper functions:
   - getServerSession() wrapper for server components
   - requireAuth() middleware function for API routes

4. Update the root layout (/app/layout.tsx):
   - Wrap the app with SessionProvider
   - Keep it simple for now (no UI changes yet)

5. Create /app/page.tsx as a temporary test page that shows:
   - Login button if not authenticated
   - Welcome message with user email if authenticated
   - Logout button if authenticated

6. Test the authentication flow:
   - Verify login with Google email works
   - Verify logout works

Success criteria:
- Can log in with Google email
- Other email domains are rejected with clear error message
- Session persists across page reloads
- Logout functionality works
- No console errors during auth flow
```

---

### Step 2.2: Create Protected Route Wrapper

**Context:** Build reusable authentication protection for pages and API routes.

**Prompt:**
```
Create authentication protection utilities that will be used throughout the application.

1. Create /components/providers/AuthProvider.tsx:
   - Client component that wraps SessionProvider
   - Handles authentication state
   - Shows loading state while checking auth

2. Create /components/ProtectedRoute.tsx:
   - Client component that checks authentication
   - Redirects to login if not authenticated
   - Shows loading spinner during check
   - Accepts children to render when authenticated

3. Create /lib/api-auth.ts with API route protection:
   - requireAuthAPI() function for API routes
   - Returns user session or throws 401 error
   - Includes type-safe return value

4. Update /app/layout.tsx to use the new AuthProvider

5. Create a test protected page /app/test-protected/page.tsx:
   - Uses ProtectedRoute component
   - Shows user email and session info
   - Verify unauthenticated users can't access it

6. Write integration tests in /app/api/__tests__/auth.test.ts:
   - Test requireAuthAPI with valid session
   - Test requireAuthAPI without session (should return 401)

Success criteria:
- Protected pages redirect unauthenticated users to login
- API routes can use requireAuthAPI helper
- No flash of protected content before redirect
- Tests pass for auth utilities
```

---

## Phase 3: GitHub API Integration

### Step 3.1: Create GitHub Service Base Layer

**Context:** Set up the foundation for GitHub API calls with proper authentication and error handling.

**Prompt:**
```
Create a GitHub API service layer using Octokit. This will be the foundation for all GitHub data fetching.

1. Create /lib/github/client.ts:
   - Initialize Octokit with personal access token from env
   - Export a singleton instance
   - Add error handling wrapper

2. Create /lib/github/types.ts:
   - Define GitHub-specific types (GitHubTag, WorkflowRun, etc.)
   - These complement but don't replace our dashboard types

3. Create /lib/github/base.ts with utility functions:
   - getOrganization() - fetch org details
   - listRepositories() - fetch all repos in org with pagination
   - Add proper error handling and logging
   - Include retry logic for rate limits

4. Create comprehensive tests in /lib/github/__tests__/base.test.ts:
   - Mock Octokit responses
   - Test successful API calls
   - Test error handling
   - Test pagination handling

5. Add environment variable validation:
   - Create /lib/env.ts that validates required env vars on startup
   - Throw clear errors if GITHUB_TOKEN or GITHUB_ORG is missing

Success criteria:
- Can fetch organization details from GitHub
- Can list all repositories with pagination
- Errors are caught and logged appropriately
- Tests pass with mocked GitHub API responses
- Clear error message if env vars are missing
```

---

### Step 3.2: Implement Repository Tags and Release Fetching

**Context:** Build functionality to fetch and parse semantic version tags (vX.Y.Z) from repositories.

**Prompt:**
```
Implement functions to fetch repository tags and calculate release statistics.

1. Create /lib/github/releases.ts with functions:
   - fetchRepositoryTags(owner, repo) - get all tags
   - filterSemanticVersionTags(tags) - filter for vX.Y.Z pattern using regex
   - calculateReleaseStats(tags) - return release statistics:
     * Total releases in last 12 months
     * Monthly breakdown for chart
     * Last release date
     * Days since last release

2. Add helper utilities in /lib/utils/date.ts:
   - isWithinLastYear(date) - check if date is within 12 months
   - getMonthKey(date) - return "YYYY-MM" format
   - daysSince(date) - calculate days from date to now
   - Add comprehensive date tests

3. Create tests in /lib/github/__tests__/releases.test.ts:
   - Test semantic version regex (match v1.2.3, v0.0.1, etc.)
   - Test filtering of non-semantic tags (should reject v1.2.3-beta, v1.2, etc.)
   - Test monthly breakdown calculation
   - Test days since calculation
   - Mock various tag scenarios (no tags, old tags, recent tags)

4. Add integration test that:
   - Mocks GitHub API responses with sample tags
   - Verifies correct release stats are generated
   - Tests edge cases (empty tags, all old tags, etc.)

Success criteria:
- Correctly identifies vX.Y.Z semantic version tags
- Rejects pre-release tags and non-semantic versions
- Accurately calculates monthly release counts
- Correctly calculates days since last release
- All tests pass with 100% coverage of edge cases
```

---

### Step 3.3: Implement Workflow and Build Statistics Fetching

**Context:** Fetch GitHub Actions workflow runs for the "Build and Push to ECR" workflow.

**Prompt:**
```
Implement functionality to fetch GitHub Actions workflow run statistics.

1. Create /lib/github/workflows.ts with functions:
   - findWorkflowByName(owner, repo, workflowName) - find workflow ID by name
   - fetchWorkflowRuns(owner, repo, workflowId, since) - fetch runs since date
   - calculateBuildStats(runs) - calculate:
     * Total successful builds
     * Total all builds
     * Success rate percentage

2. Handle the case where workflow doesn't exist:
   - Return null if "Build and Push to ECR" workflow not found
   - Log warning but don't throw error (per spec: skip repository)

3. Create /lib/utils/stats.ts with calculation helpers:
   - calculateSuccessRate(successful, total) - return percentage
   - roundToDecimal(number, places) - utility for formatting

4. Create tests in /lib/github/__tests__/workflows.test.ts:
   - Mock workflow list API response
   - Test finding workflow by name (case-insensitive matching)
   - Test workflow not found scenario
   - Mock workflow runs with various statuses
   - Test build statistics calculations
   - Test success rate edge cases (0 builds, 100% success, 0% success)

5. Add time filtering tests:
   - Verify only runs from last 12 months are counted
   - Test date boundary conditions

Success criteria:
- Can find workflow by exact name match
- Returns null gracefully if workflow doesn't exist
- Correctly counts only successful runs
- Accurately calculates success rate
- Filters runs to last 12 months only
- All tests pass including edge cases
```

---

### Step 3.4: Implement Repository Activity and Contributor Fetching

**Context:** Fetch contributor counts, commit activity, PR counts, and code churn metrics.

**Prompt:**
```
Implement functions to fetch repository activity metrics for the last 30 days.

1. Create /lib/github/activity.ts with functions:
   - fetchContributors(owner, repo) - get contributor count
   - fetchCommitActivity(owner, repo, since) - get commits in last 30 days
   - fetchMergedPRs(owner, repo, since) - get merged PRs in last 30 days
   - fetchCodeFrequency(owner, repo) - get lines added/deleted
   - calculateCommitFrequency(commits, days) - avg commits per week

2. Add date range filtering:
   - Create /lib/utils/date.ts additions:
     * getLast30Days() - return date 30 days ago
     * getLast12Months() - return date 12 months ago

3. Handle GitHub API statistics endpoints:
   - Note: Some stats endpoints may return 202 (not ready)
   - Implement retry logic with exponential backoff
   - Maximum 3 retries, then return default/null values

4. Create /lib/github/aggregator.ts:
   - combineActivityMetrics() - aggregate all activity data
   - Return properly typed activity object matching RepositoryData interface

5. Create comprehensive tests in /lib/github/__tests__/activity.test.ts:
   - Mock contributor API responses
   - Mock commit activity with various date ranges
   - Test filtering to last 30 days
   - Mock merged PR responses
   - Test code frequency parsing
   - Test commit frequency calculation
   - Test 202 response retry logic
   - Test retry failure fallback

Success criteria:
- Fetches all required activity metrics
- Correctly filters to last 30 days
- Handles GitHub stats API 202 responses with retries
- Calculates commits per week accurately
- Falls back gracefully on API failures
- All tests pass with mocked scenarios
```

---

### Step 3.5: Create Repository Data Aggregator

**Context:** Combine all GitHub API calls into a single function that fetches complete repository data.

**Prompt:**
```
Create a high-level aggregator that fetches all data for a single repository and returns a complete RepositoryData object.

1. Create /lib/github/repository.ts with main function:
   - fetchRepositoryData(owner, repo) - orchestrates all data fetching
   - Calls all previously created functions:
     * Release statistics
     * Build statistics
     * Activity metrics
     * Contributor count
     * Commit frequency
   - Handles errors gracefully (returns null if repository should be skipped)
   - Implements parallel fetching where possible using Promise.all

2. Add skip conditions (per spec):
   - Skip if no "Build and Push to ECR" workflow found
   - Skip if API errors occur
   - Log skipped repositories with reason
   - Return null (don't throw errors)

3. Add logging:
   - Create /lib/logger.ts with simple logging utility
   - Log info, warn, and error levels
   - Include timestamps and context

4. Create /lib/github/organization.ts:
   - fetchOrganizationData() - fetches data for ALL repositories
   - Uses parallel fetching with concurrency limit (5 at a time)
   - Filters out null results (skipped repositories)
   - Returns array of RepositoryData objects

5. Create tests in /lib/github/__tests__/repository.test.ts:
   - Mock all sub-function calls
   - Test successful complete data fetch
   - Test skip scenarios (no workflow, API errors)
   - Test parallel fetching
   - Verify null results are filtered out

6. Integration test in /lib/github/__tests__/integration.test.ts:
   - Mock complete GitHub API flow
   - Test fetching data for mock organization with 5 repos
   - Verify proper data structure
   - Test error handling across multiple repos

Success criteria:
- Can fetch complete data for a single repository
- Properly skips repositories per spec requirements
- Uses parallel fetching for efficiency
- Handles partial failures (some repos succeed, some skip)
- Returns properly typed RepositoryData array
- All tests pass with realistic scenarios
- No hanging promises or race conditions
```

---

## Phase 4: Caching Layer

### Step 4.1: Implement In-Memory Cache

**Context:** Create a simple in-memory cache with 15-minute TTL to reduce GitHub API calls.

**Prompt:**
```
Implement an in-memory caching layer for repository data with TTL and manual refresh support.

1. Create /lib/cache/memory-cache.ts:
   - Implement MemoryCache class with generic typing
   - Methods:
     * get(key) - retrieve cached value if not expired
     * set(key, value, ttl) - store value with expiration
     * invalidate(key) - manually clear cache entry
     * clear() - clear all cache
   - Use Map for storage
   - Include timestamp tracking

2. Create /lib/cache/repository-cache.ts:
   - Specific cache for repository data
   - getCachedRepositoryData(orgName)
   - setCachedRepositoryData(orgName, data, stats)
   - Default TTL: 15 minutes (900000ms)
   - Export singleton instance

3. Add cache statistics:
   - Track hits and misses
   - Track last fetch timestamp
   - getCacheStats() method for debugging

4. Create tests in /lib/cache/__tests__/memory-cache.test.ts:
   - Test cache storage and retrieval
   - Test TTL expiration (use fake timers)
   - Test manual invalidation
   - Test cache miss scenarios
   - Test clear functionality

5. Create tests in /lib/cache/__tests__/repository-cache.test.ts:
   - Test repository-specific caching
   - Test 15-minute TTL
   - Mock time progression
   - Verify expired cache returns null

Success criteria:
- Cache stores and retrieves data correctly
- Cache expires after 15 minutes
- Manual cache invalidation works
- Cache returns null for expired entries
- Tests use fake timers to verify TTL
- All tests pass
```

---

## Phase 5: API Routes

### Step 5.1: Create Repository Data API Endpoint

**Context:** Build the main API endpoint that returns repository data to the frontend, with caching and authentication.

**Prompt:**
```
Create the /api/repositories endpoint that fetches repository data with authentication and caching.

1. Create /app/api/repositories/route.ts:
   - Implement GET handler
   - Require authentication using requireAuthAPI()
   - Accept optional query parameter: refresh=true
   - Logic flow:
     a. Check authentication
     b. Get org name from environment
     c. Check cache (unless refresh=true)
     d. If cache hit: return cached data
     e. If cache miss or refresh:
        - Fetch data using fetchOrganizationData()
        - Calculate organization-wide statistics
        - Cache the results
        - Return data
   - Return JSON: { repositories: RepositoryData[], stats: OrganizationStats, lastUpdated: timestamp }

2. Create /lib/stats/organization-stats.ts:
   - calculateOrganizationStats(repositories) function
   - Calculate:
     * Total repositories count
     * Total releases this month across all repos
     * Average build success rate across all repos
   - Handle edge cases (no repositories, no builds)

3. Add error handling:
   - Catch GitHub API errors
   - Return 500 with error message
   - Return cached data if available on error
   - Log errors with context

4. Create tests in /app/api/repositories/__tests__/route.test.ts:
   - Mock authentication (both authenticated and unauthenticated)
   - Mock GitHub API calls
   - Test cache hit scenario
   - Test cache miss scenario
   - Test refresh parameter
   - Test error scenarios
   - Verify proper response structure

5. Integration test:
   - Test full flow from API call to response
   - Verify caching works across multiple calls
   - Verify refresh bypasses cache

Success criteria:
- Endpoint requires authentication (401 if not authenticated)
- Returns cached data when available
- Fetches fresh data on cache miss or refresh
- Calculates organization stats correctly
- Returns proper JSON structure
- Handles errors gracefully
- All tests pass
```

---

## Phase 6: Frontend - Layout and Dashboard Shell

### Step 6.1: Create Dashboard Layout with Header

**Context:** Build the main dashboard layout structure with header, navigation, and content area.

**Prompt:**
```
Create the main dashboard layout with header, authentication UI, and basic structure.

1. Create /components/layout/Header.tsx:
   - Display dashboard title: "CI Dashboard"
   - Show organization name from environment (client-side safe value)
   - User profile section with email and avatar (from Google)
   - Logout button
   - Manual refresh button (placeholder for now)
   - Last updated timestamp (passed as prop)
   - Use Tailwind CSS for styling
   - Responsive but desktop-optimized

2. Create /components/layout/DashboardLayout.tsx:
   - Container for dashboard content
   - Includes Header component
   - Main content area with proper spacing
   - Loading state support
   - Error state support

3. Create /app/dashboard/page.tsx:
   - Protected route using ProtectedRoute component
   - Uses DashboardLayout
   - Placeholder content for now: "Dashboard content coming soon"
   - Fetch user session to pass to Header

4. Update /app/page.tsx:
   - Check if authenticated
   - If authenticated: redirect to /dashboard
   - If not: show login page with "Sign in with Google" button
   - Simple, clean design

5. Style components with Tailwind:
   - Use clean, professional design
   - Neutral color palette
   - Good spacing and typography
   - Desktop-first approach

6. Create component tests:
   - Test Header renders user info correctly
   - Test logout button functionality
   - Test DashboardLayout renders children
   - Test redirect logic on home page

Success criteria:
- Authenticated users see dashboard with header
- Header shows user email and logout button
- Dashboard layout is clean and professional
- Login page redirects to dashboard after auth
- Dashboard is only accessible when authenticated
- All components have proper TypeScript types
- Tests pass
```

---

### Step 6.2: Create Organization Statistics Summary Bar

**Context:** Display organization-wide statistics at the top of the dashboard.

**Prompt:**
```
Create a statistics summary bar that displays organization-wide metrics above the repository grid.

1. Create /components/dashboard/StatsSummary.tsx:
   - Display three key metrics side-by-side:
     * Total Repositories: count with icon
     * Releases This Month: count with icon
     * Avg Build Success Rate: percentage with icon
   - Use card/panel styling with Tailwind
   - Desktop-optimized layout (3 columns)
   - Props: OrganizationStats interface
   - Add loading skeleton state

2. Create /components/ui/StatCard.tsx:
   - Reusable stat display component
   - Props: label, value, icon (optional), format (number/percentage)
   - Clean typography and spacing
   - Subtle background color

3. Update /app/dashboard/page.tsx:
   - Fetch data from /api/repositories
   - Pass organization stats to StatsSummary
   - Show loading state while fetching
   - Handle error state

4. Create loading skeleton:
   - /components/ui/Skeleton.tsx
   - Generic skeleton component for loading states
   - Animated pulse effect

5. Create tests:
   - Test StatsSummary renders all three metrics
   - Test StatCard formatting (number vs percentage)
   - Test loading skeleton appears during fetch
   - Mock API response in dashboard page test

Success criteria:
- Summary bar displays all three metrics correctly
- Numbers are formatted appropriately (commas, decimals)
- Loading state shows before data arrives
- Clean, professional design
- All TypeScript types are correct
- Tests pass
```

---

### Step 6.3: Create Search and Filter Bar

**Context:** Add search functionality to filter repositories by name.

**Prompt:**
```
Implement search/filter functionality for repositories with proper state management.

1. Create /components/dashboard/SearchBar.tsx:
   - Text input for searching repositories
   - Real-time filtering (no submit button)
   - Clear button (X) when text is entered
   - Placeholder: "Search repositories..."
   - onChange callback to parent
   - Tailwind styling with focus states

2. Create /hooks/useRepositoryFilter.ts:
   - Custom hook for filtering logic
   - Takes repositories array and search term
   - Returns filtered and sorted repositories
   - Implements:
     * Case-insensitive search by repository name
     * Sort by releases in last 30 days (descending)
   - Memoized with useMemo for performance

3. Update /app/dashboard/page.tsx:
   - Add SearchBar component
   - Implement search state
   - Use useRepositoryFilter hook
   - Pass filtered/sorted repositories to grid (placeholder for now)
   - Show "No repositories found" when filter returns empty

4. Add debouncing:
   - Create /hooks/useDebounce.ts
   - Debounce search input (300ms delay)
   - Improves performance with large repository lists

5. Create tests:
   - Test SearchBar component renders and accepts input
   - Test useRepositoryFilter with various search terms
   - Test sorting logic
   - Test debouncing behavior
   - Test empty results handling

Success criteria:
- Search filters repositories in real-time
- Search is case-insensitive
- Repositories are sorted by last 30 days releases
- Debouncing prevents excessive filtering
- Clear button works
- Shows appropriate message when no results
- All tests pass
```

---

## Phase 7: Frontend - Repository Cards

### Step 7.1: Create Repository Card Shell

**Context:** Build the repository card component structure without charts first.

**Prompt:**
```
Create the repository card component with all metrics except the chart (chart comes next).

1. Create /components/dashboard/RepositoryCard.tsx:
   - Card container with hover effect
   - Click handler to open GitHub URL in new tab
   - Card sections:
     * Header: Repository name as link
     * Chart placeholder: "Chart coming soon" message
     * Release info section
     * Build stats section
     * Activity metrics section
     * Repository metrics section
   - Use grid layout for metrics
   - Props: RepositoryData interface
   - Tailwind styling: shadow, rounded corners, padding

2. Create metric display sub-components:
   - /components/dashboard/MetricRow.tsx
     * Simple label + value display
     * Props: label, value, format (string, number, percentage, date)
   - /components/dashboard/MetricSection.tsx
     * Section wrapper with heading
     * Container for multiple MetricRow components

3. Implement metric formatting:
   - Create /lib/utils/formatters.ts:
     * formatNumber(num) - add commas (1,234)
     * formatPercentage(num) - add % symbol (94.5%)
     * formatDate(date) - human readable (Dec 15, 2025)
     * formatDaysAgo(days) - "14 days ago", "Never"
     * formatCodeChurn(added, deleted) - "+1,234 / -567"

4. Update /app/dashboard/page.tsx:
   - Create grid layout for repository cards
   - Map over filtered repositories
   - Render RepositoryCard for each
   - Use CSS Grid with responsive columns (3-4 per row)

5. Create tests:
   - Test RepositoryCard renders all sections
   - Test click handler opens correct URL
   - Test metric formatting functions
   - Test grid layout renders multiple cards
   - Mock repository data for tests

Success criteria:
- Cards display all metrics except chart
- Clicking card opens GitHub repository in new tab
- Metrics are properly formatted
- Grid layout works with multiple cards
- Hover effects work smoothly
- All TypeScript types are correct
- Tests pass
```

---

### Step 7.2: Integrate Chart.js for Release History

**Context:** Add the monthly release chart to repository cards using Chart.js.

**Prompt:**
```
Integrate Chart.js to display monthly release history bar charts on each repository card.

1. Install and configure Chart.js:
   - Ensure chart.js and react-chartjs-2 are installed
   - Create /lib/chart/config.ts with default chart settings:
     * Responsive configuration
     * Clean, minimal styling
     * Color scheme matching dashboard
     * Disable legends (not needed)
     * Configure tooltips

2. Create /components/charts/ReleaseChart.tsx:
   - Bar chart component
   - Props: monthlyBreakdown (MonthlyRelease[])
   - X-axis: Month labels (Jan, Feb, Mar...)
   - Y-axis: Release count
   - Chart size: appropriate for card (height ~200px)
   - Handle empty data (no releases)
   - Memoized with React.memo for performance

3. Create chart data transformer:
   - /lib/chart/transforms.ts
   - transformMonthlyReleases(data) function
   - Convert MonthlyRelease[] to Chart.js format
   - Generate last 12 months labels even if no data
   - Fill missing months with 0

4. Update RepositoryCard:
   - Replace chart placeholder with ReleaseChart
   - Pass monthlyBreakdown data
   - Show "No releases" message if empty

5. Add loading optimization:
   - Lazy load Chart.js components
   - Use dynamic import with next/dynamic
   - Show skeleton while chart loads

6. Create tests:
   - Test ReleaseChart renders with data
   - Test empty data scenario
   - Test data transformation
   - Test chart configuration
   - Snapshot test for chart structure

Success criteria:
- Charts display correctly on each card
- Last 12 months are shown on X-axis
- Missing months show as 0
- Charts handle empty data gracefully
- Charts are performant with many cards
- Chart styling matches dashboard theme
- All tests pass
```

---

### Step 7.3: Add Loading and Error States to Dashboard

**Context:** Improve UX with proper loading skeletons and error handling.

**Prompt:**
```
Add comprehensive loading and error states to the dashboard for better user experience.

1. Create /components/ui/CardSkeleton.tsx:
   - Skeleton loader matching RepositoryCard layout
   - Animated pulse effect
   - Same dimensions as actual card
   - Shows all sections as gray rectangles

2. Create /components/ui/ErrorMessage.tsx:
   - Error display component
   - Props: message, retry callback (optional)
   - Show error icon
   - Show "Try Again" button if retry provided
   - Clean, non-alarming design

3. Update /app/dashboard/page.tsx:
   - Add loading state management
   - Add error state management
   - Show grid of CardSkeletons while loading (6-8 skeletons)
   - Show ErrorMessage on fetch failure
   - Implement retry functionality
   - Show stale data with warning if refresh fails

4. Add error boundary:
   - Create /components/ErrorBoundary.tsx
   - Catch React rendering errors
   - Show fallback UI
   - Log errors to console
   - Wrap dashboard in error boundary

5. Add optimistic UI updates:
   - Show loading indicator during manual refresh
   - Keep existing data visible during refresh
   - Show toast notification on success/failure

6. Create /components/ui/Toast.tsx:
   - Simple toast notification component
   - Auto-dismiss after 3 seconds
   - Success and error variants
   - Position: top-right corner

Success criteria:
- Loading skeletons appear while fetching data
- Error messages display on failures
- Retry button works correctly
- Error boundary catches React errors
- Toast notifications show for actions
- Existing data stays visible during refresh
- All states have proper TypeScript types
- Tests pass for all state variations
```

---

## Phase 8: Manual Refresh Functionality

### Step 8.1: Implement Manual Refresh with Cache Invalidation

**Context:** Add the manual refresh button functionality that forces fresh data fetch.

**Prompt:**
```
Implement manual refresh functionality that bypasses cache and fetches fresh data from GitHub.

1. Update /components/layout/Header.tsx:
   - Make refresh button functional
   - Show loading spinner when refreshing
   - Disable button during refresh
   - Props: onRefresh callback, isRefreshing boolean
   - Add keyboard shortcut: Cmd/Ctrl + R

2. Create /hooks/useRepositoryData.ts:
   - Custom hook for data fetching and refresh
   - Manages loading and error states
   - Methods:
     * fetchData() - initial fetch
     * refresh() - force refresh with cache bypass
   - Calls /api/repositories with refresh parameter
   - Returns: { data, stats, loading, error, lastUpdated, refresh }

3. Update /app/dashboard/page.tsx:
   - Use useRepositoryData hook
   - Pass refresh function and state to Header
   - Update lastUpdated display in header
   - Show toast on successful refresh
   - Show toast on refresh error

4. Add refresh indicator:
   - Update /components/ui/Toast.tsx if needed
   - Show "Refreshing data..." during refresh
   - Show "Data refreshed successfully!" on success
   - Show "Refresh failed. Showing cached data." on error

5. Add last updated display:
   - Create /lib/utils/time.ts
   - formatTimeAgo(timestamp) - "2 minutes ago", "just now"
   - Display in header next to refresh button

6. Add keyboard shortcut handler:
   - Create /hooks/useKeyboardShortcut.ts
   - Listen for Cmd/Ctrl + R
   - Prevent default browser refresh
   - Trigger data refresh instead

7. Create tests:
   - Test useRepositoryData hook
   - Test initial fetch
   - Test refresh with cache bypass
   - Test error handling
   - Test keyboard shortcut
   - Mock API calls

Success criteria:
- Refresh button triggers fresh data fetch
- Loading indicator shows during refresh
- API called with refresh=true parameter
- Cache is bypassed on refresh
- Last updated timestamp updates after refresh
- Toast notifications work correctly
- Keyboard shortcut works (Cmd/Ctrl + R)
- Button is disabled during refresh
- All tests pass
```

---

## Phase 9: Polish and Refinement

### Step 9.1: Add Sorting and Additional UI Polish

**Context:** Final UI improvements including proper repository sorting and visual polish.

**Prompt:**
```
Add final UI polish and ensure repository sorting works correctly.

1. Verify and enhance sorting:
   - Update /hooks/useRepositoryFilter.ts
   - Ensure sorting by "releases in last 30 days" works
   - Add secondary sort by repository name (alphabetical)
   - Handle ties properly

2. Add empty state:
   - Create /components/dashboard/EmptyState.tsx
   - Show when organization has no repositories
   - Show appropriate icon and message
   - Different message for "no results" vs "no repos"

3. Add repository count display:
   - Show "Showing X repositories" below search bar
   - Update when search filters results
   - Format: "Showing 12 of 45 repositories"

4. Enhance card interactions:
   - Add subtle scale on hover
   - Add focus states for accessibility
   - Ensure proper cursor (pointer)
   - Add transition animations

5. Improve responsive behavior:
   - Verify grid works on smaller desktops (1366x768)
   - Adjust card padding for smaller screens
   - Ensure readable text at all sizes
   - Keep desktop-first but functional

6. Add loading performance:
   - Implement virtualization if > 50 repos
   - Use React.memo on appropriate components
   - Verify no unnecessary re-renders
   - Test with large dataset (mock 100+ repos)

7. Accessibility improvements:
   - Add proper ARIA labels
   - Ensure keyboard navigation works
   - Add focus indicators
   - Test with screen reader (basic check)

Success criteria:
- Repositories are sorted correctly by last 30 days releases
- Empty states show appropriate messages
- Repository count displays and updates
- Hover effects are smooth and subtle
- No accessibility warnings in browser console
- Performance is good with 50+ repositories
- All previous functionality still works
- Tests pass
```

---

### Step 9.2: Add Comprehensive Error Handling and Logging

**Context:** Ensure robust error handling throughout the application with proper logging.

**Prompt:**
```
Add comprehensive error handling, logging, and monitoring throughout the application.

1. Enhance /lib/logger.ts:
   - Add log levels: debug, info, warn, error
   - Add context object support
   - Format logs consistently
   - Include timestamps
   - Add environment check (suppress debug in production)

2. Add error tracking points:
   - GitHub API errors (with retry count)
   - Cache errors
   - Authentication errors
   - Component render errors
   - Network errors

3. Create /lib/errors/github-errors.ts:
   - Custom error classes:
     * GitHubApiError
     * RateLimitError
     * AuthenticationError
     * RepositoryNotFoundError
   - Include status code and helpful messages
   - Include retry information

4. Update error handling in API routes:
   - Use custom error classes
   - Log all errors with context
   - Return appropriate HTTP status codes
   - Include helpful error messages
   - Don't expose sensitive information

5. Add client-side error logging:
   - Log errors to console in development
   - Prepare for error tracking service (stub)
   - Include user context (email, session)
   - Include component stack traces

6. Add health check endpoint:
   - Create /app/api/health/route.ts
   - Check GitHub API connectivity
   - Check cache functionality
   - Return status: healthy/degraded/unhealthy
   - Useful for monitoring

7. Create comprehensive tests:
   - Test error classes
   - Test error handling in API routes
   - Test error logging
   - Test health check endpoint
   - Mock various error scenarios

Success criteria:
- All errors are properly caught and logged
- Error messages are helpful and non-technical for users
- Developers can debug issues from logs
- Health check endpoint works
- No uncaught promise rejections
- Error boundaries catch all render errors
- All tests pass
```

---

## Phase 10: Testing and Quality Assurance

### Step 10.1: Add End-to-End Tests

**Context:** Add comprehensive end-to-end tests covering main user flows.

**Prompt:**
```
Add end-to-end tests that cover the main user flows through the application.

1. Set up testing infrastructure:
   - Install @playwright/test (if not already installed)
   - Create playwright.config.ts
   - Set up test environment with mock data
   - Create test utilities and helpers

2. Create /e2e/auth.spec.ts:
   - Test login flow with Google OAuth (mock)
   - Test logout flow
   - Test redirect after login
   - Test protected route access

3. Create /e2e/dashboard.spec.ts:
   - Test dashboard loads successfully
   - Test organization stats display
   - Test repository cards render
   - Test search functionality
   - Test manual refresh button
   - Test card click (opens GitHub)
   - Test keyboard shortcuts

4. Create /e2e/data-flow.spec.ts:
   - Test complete data flow from API to UI
   - Test caching behavior
   - Test cache expiration (mock time)
   - Test error handling
   - Test empty states

5. Set up test data:
   - Create /e2e/fixtures/mock-repos.ts
   - Mock GitHub API responses
   - Include various scenarios:
     * Repos with many releases
     * Repos with no releases
     * Repos with high/low build success
     * Repos with various activity levels

6. Add visual regression tests:
   - Take screenshots of key pages
   - Compare against baseline
   - Test: login page, dashboard, cards

Success criteria:
- All critical user flows are tested
- Tests use realistic mock data
- Tests are stable and don't flake
- Visual regression tests catch UI changes
- All E2E tests pass
- Tests run in CI-ready mode
```

---

### Step 10.2: Performance Testing and Optimization

**Context:** Test and optimize application performance with realistic data loads.

**Prompt:**
```
Test application performance and optimize any bottlenecks.

1. Create performance test suite:
   - Create /tests/performance/dashboard.perf.ts
   - Test with varying repository counts:
     * 10 repositories
     * 50 repositories
     * 100 repositories
   - Measure:
     * Initial page load time
     * Time to interactive
     * API response time
     * Chart render time
     * Search filter performance

2. Add performance monitoring:
   - Create /lib/monitoring/performance.ts
   - Track key metrics:
     * API call duration
     * Component render time
     * Cache hit/miss rate
   - Log slow operations (> 1s)

3. Optimize based on findings:
   - Add React.memo to expensive components
   - Optimize chart rendering (virtual scrolling if needed)
   - Optimize search filtering
   - Reduce re-renders with proper dependency arrays
   - Add request coalescing if needed

4. Bundle size analysis:
   - Analyze bundle size
   - Check for duplicate dependencies
   - Verify code splitting works
   - Check Chart.js bundle impact
   - Ensure tree shaking is effective

5. Create performance budget:
   - Document acceptable thresholds:
     * API response < 3s
     * Page load < 2s
     * Search filter < 100ms
     * Chart render < 500ms
   - Add tests to enforce budgets

6. Load testing:
   - Test with 100+ repositories
   - Test concurrent user access (if applicable)
   - Test cache effectiveness
   - Verify no memory leaks

Success criteria:
- Dashboard loads in under 2 seconds
- Search is instant (< 100ms)
- Charts render smoothly
- No memory leaks detected
- Performance budgets are met
- Bundle size is reasonable (< 500KB gzipped)
- All performance tests pass
```

---

## Phase 11: Docker and Deployment

### Step 11.1: Create Docker Configuration

**Context:** Set up Docker for containerized deployment.

**Prompt:**
```
Create Docker configuration for building and running the application in a container.

1. Create Dockerfile:
   - Multi-stage build for optimization
   - Stage 1: Dependencies (npm ci)
   - Stage 2: Build (npm run build)
   - Stage 3: Production (minimal image)
   - Base image: node:18-alpine
   - Expose port 3000
   - Health check configuration
   - Non-root user for security

2. Create .dockerignore:
   - Exclude node_modules
   - Exclude .git
   - Exclude .env.local
   - Exclude test files
   - Exclude documentation

3. Create docker-compose.yml:
   - Service definition for ci-dashboard
   - Port mapping (3000:3000)
   - Environment variable file reference
   - Volume mounts for development (optional)
   - Restart policy
   - Health check

4. Create .env.production.example:
   - Template for production environment variables
   - All required variables listed
   - No default values (security)
   - Instructions in comments

5. Update README.md:
   - Add Docker build instructions
   - Add Docker run instructions
   - Add docker-compose instructions
   - Document environment variables
   - Add troubleshooting section

6. Test Docker build:
   - Build image locally
   - Run container
   - Verify application works
   - Test with production-like env vars
   - Check health endpoint
   - Verify logs

7. Add build scripts to package.json:
   - "docker:build" script
   - "docker:run" script
   - "docker:stop" script

Success criteria:
- Docker image builds successfully
- Image size is optimized (< 200MB)
- Container starts without errors
- Application is accessible on port 3000
- Environment variables are loaded correctly
- Health check works
- Logs are visible
- Can stop and restart container
- README has clear deployment instructions
```

---

### Step 11.2: Add Production Optimizations

**Context:** Final production-ready optimizations and configuration.

**Prompt:**
```
Add production optimizations and prepare the application for deployment.

1. Update next.config.js:
   - Enable production optimizations
   - Configure output: 'standalone' for Docker
   - Add security headers
   - Configure compression
   - Add environment variable validation

2. Add security headers:
   - Content Security Policy (CSP)
   - X-Frame-Options
   - X-Content-Type-Options
   - Referrer-Policy
   - Permissions-Policy

3. Create startup script:
   - Create /scripts/startup.sh
   - Validate environment variables
   - Run database migrations (if applicable)
   - Start application
   - Make executable

4. Add graceful shutdown:
   - Handle SIGTERM and SIGINT
   - Close database connections (if applicable)
   - Finish in-flight requests
   - Clean up resources

5. Configure logging for production:
   - Update logger to write to stdout/stderr
   - Add structured logging (JSON format)
   - Include request IDs
   - Add log rotation considerations

6. Add monitoring hooks:
   - Create /app/api/metrics/route.ts
   - Expose basic metrics:
     * Uptime
     * Memory usage
     * Cache statistics
     * Request count
   - Protect with API key

7. Create production checklist:
   - Create DEPLOYMENT.md
   - Pre-deployment checklist
   - Post-deployment verification steps
   - Rollback procedure
   - Monitoring setup

8. Update documentation:
   - Add architecture diagram to README
   - Document all environment variables
   - Add troubleshooting guide
   - Add API documentation

Success criteria:
- Application starts and stops gracefully
- All environment variables are validated
- Security headers are configured
- Logging works properly in production
- Metrics endpoint is accessible
- Documentation is complete and accurate
- Docker image is production-ready
- Health checks work correctly
```

---

## Phase 12: Final Testing and Documentation

### Step 12.1: Comprehensive Testing Pass

**Context:** Final comprehensive testing before considering the project complete.

**Prompt:**
```
Perform a comprehensive testing pass to verify all requirements are met.

1. Create test checklist:
   - Create /TESTING.md
   - List all features from spec
   - Create manual test cases for each
   - Include edge cases and error scenarios

2. Manual testing session:
   - Test complete authentication flow
   - Test with real GitHub organization (if possible)
   - Test all dashboard features:
     * Organization stats
     * Repository cards and all metrics
     * Charts with various data sets
     * Search functionality
     * Manual refresh
     * Keyboard shortcuts
   - Test error scenarios:
     * No GitHub token
     * Invalid token
     * GitHub API down
     * Network errors
     * Repositories without workflows

3. Test with various data scenarios:
   - Empty organization (no repos)
   - Small organization (< 10 repos)
   - Medium organization (10-50 repos)
   - Large organization (50+ repos)
   - Repositories with no releases
   - Repositories with no builds
   - Repositories with failing builds

4. Accessibility testing:
   - Run axe DevTools
   - Test keyboard navigation
   - Test with screen reader (basic)
   - Verify ARIA labels
   - Check color contrast
   - Test with browser zoom (150%, 200%)

5. Browser compatibility testing:
   - Test in Chrome
   - Test in Firefox
   - Test in Safari
   - Test in Edge
   - Document any issues

6. Security testing:
   - Verify GitHub token is never exposed
   - Verify domain restriction works
   - Test authentication bypass attempts
   - Check for XSS vulnerabilities
   - Verify CSP headers

7. Performance testing:
   - Test initial load time
   - Test time to interactive
   - Test refresh performance
   - Monitor memory usage over time
   - Check for memory leaks

8. Document any issues:
   - Create KNOWN_ISSUES.md
   - List limitations
   - List future improvements
   - Note any workarounds

Success criteria:
- All features from spec are working
- No critical bugs found
- Accessibility standards met
- Security testing passes
- Performance meets requirements
- Documentation is accurate
- Known issues are documented
```

---

### Step 12.2: Final Documentation and Handoff

**Context:** Complete all documentation for production deployment and maintenance.

**Prompt:**
```
Complete comprehensive documentation for deployment, operation, and maintenance.

1. Update README.md:
   - Project overview
   - Features list
   - Screenshots (optional but helpful)
   - Quick start guide
   - Development setup
   - Testing instructions
   - Deployment instructions
   - Contributing guidelines (if applicable)

2. Create ARCHITECTURE.md:
   - System architecture diagram
   - Component structure
   - Data flow diagram
   - Authentication flow
   - Caching strategy
   - API structure
   - Technology stack with versions

3. Create DEPLOYMENT.md:
   - Prerequisites
   - Environment variables (complete list with descriptions)
   - Docker deployment steps
   - Manual deployment steps (alternative)
   - Google OAuth setup instructions
   - GitHub token creation instructions
   - SSL/TLS setup
   - Monitoring setup
   - Backup strategy (if applicable)

4. Create MAINTENANCE.md:
   - Regular maintenance tasks
   - Log monitoring
   - Performance monitoring
   - Security updates
   - Dependency updates
   - Troubleshooting guide
   - Common issues and solutions

5. Create API.md:
   - Document all API endpoints
   - Request/response formats
   - Authentication requirements
   - Error responses
   - Rate limiting (if applicable)

6. Create CHANGELOG.md:
   - Initial release notes
   - Version 1.0.0
   - List all features
   - Known limitations

7. Create CONTRIBUTING.md (if open for contributions):
   - Development setup
   - Code style guidelines
   - Testing requirements
   - Pull request process

8. Add inline code documentation:
   - Review all files for proper JSDoc comments
   - Document all public functions
   - Document complex logic
   - Add examples where helpful

9. Create development guide:
   - Create DEVELOPMENT.md
   - Local development setup
   - Running tests
   - Code structure
   - Adding new features
   - Debugging tips

Success criteria:
- All documentation is complete and accurate
- Screenshots are clear (if included)
- Instructions are easy to follow
- A new developer can set up and run the project
- A DevOps engineer can deploy the project
- Documentation covers all edge cases
- Links in documentation are valid
- Code is well-commented
```

---

## Appendix: Quick Reference

### Environment Variables Summary
```
GOOGLE_CLIENT_ID - Google OAuth client ID
GOOGLE_CLIENT_SECRET - Google OAuth client secret
NEXTAUTH_URL - Application URL (http://localhost:3000 for dev)
NEXTAUTH_SECRET - Random secret for NextAuth.js
GITHUB_TOKEN - GitHub personal access token
GITHUB_ORG - GitHub organization name
```

### Testing Commands
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:e2e      # Run E2E tests
npm run test:coverage # Generate coverage report
```

### Docker Commands
```bash
npm run docker:build  # Build Docker image
npm run docker:run    # Run Docker container
npm run docker:stop   # Stop Docker container
```

### Project Structure Summary
```
/app                  # Next.js app directory
  /api               # API routes
  /dashboard         # Dashboard pages
/components          # React components
  /charts           # Chart components
  /dashboard        # Dashboard-specific components
  /layout           # Layout components
  /ui               # Reusable UI components
/lib                 # Utility functions and services
  /cache            # Caching layer
  /github           # GitHub API integration
  /utils            # Helper utilities
/types               # TypeScript type definitions
/e2e                 # End-to-end tests
```

---

## Implementation Timeline

**Total Estimated Time: 7-11 days**

- **Phase 1-2 (Setup & Auth)**: 1-2 days
- **Phase 3-4 (GitHub & Cache)**: 2-3 days
- **Phase 5-6 (API & Layout)**: 1-2 days
- **Phase 7-8 (Cards & Refresh)**: 2-3 days
- **Phase 9-10 (Polish & Testing)**: 1-2 days
- **Phase 11-12 (Docker & Docs)**: 1-2 days

---

## Notes for LLM Implementation

When implementing these prompts with a code-generation LLM:

1. **Execute in order** - Each step builds on previous steps
2. **Run tests frequently** - Verify each step before moving on
3. **Commit after each step** - Easier to track progress and rollback if needed
4. **Review generated code** - Ensure it matches requirements
5. **Test integrations** - Verify new code works with existing code
6. **Keep spec handy** - Reference the spec.md document frequently
7. **Document deviations** - Note any changes from the plan
8. **Ask for clarification** - If requirements are unclear, ask before implementing

---

**Document Version**: 1.0  
**Last Updated**: December 29, 2025  
**Status**: Ready for Implementation
