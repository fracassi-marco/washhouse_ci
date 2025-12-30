# CI Dashboard - Feature-First Implementation

**Architecture:** Hexagonal Architecture (Vertical Slices)  
**Strategy:** Each feature is fully implemented through all layers for immediate, visible results  
**Current Feature:** 🎯 Feature 2 - Repository List  

---

## ✅ Phase 0: Foundation (COMPLETED)

- [x] Git repository initialized
- [x] Next.js project with hexagonal structure
- [x] TypeScript configured with path aliases
- [x] Tailwind CSS v4 configured
- [x] Basic app structure (app/, src/, components/)

---

## Feature 1: 🔐 Authentication with Google OAuth

**Deliverable:** Users can log in with Google and see a protected dashboard

### 1.1 Domain Layer - User Model
- [x] `src/domain/models/User.ts` - User class (id, email, name)
- [x] `src/domain/ports/IAuthProvider.ts` - Interface (getCurrentUser, validateDomain)
- [x] Unit tests for User model
- [x] ✅ **Checkpoint:** Pure domain model with no dependencies
- [x] **Commit:** "✨ Add User domain model"

### 1.2 Infrastructure - Auth Setup
- [x] `src/infrastructure/config/env.ts` - Environment config (Google, NextAuth vars)
- [x] `src/infrastructure/adapters/auth/NextAuthProvider.ts` - Implements IAuthProvider
- [x] `app/api/auth/[...nextauth]/route.ts` - NextAuth config with domain restriction
- [x] ✅ **Checkpoint:** Can log in with Google in browser
- [x] **Commit:** "🔐 Set up Google OAuth authentication"

### 1.3 UI - Login & Protected Routes
- [x] `app/page.tsx` - Login page with "Sign in with Google" button
- [x] `components/providers/AuthProvider.tsx` - SessionProvider wrapper
- [x] `components/ProtectedRoute.tsx` - Auth check with redirect
- [x] `app/dashboard/page.tsx` - Protected dashboard (shows user email + logout)
- [x] ✅ **Checkpoint:** Full login flow works, dashboard is protected
- [x] **Commit:** "🎨 Add login UI and protected dashboard"

**✨ FEATURE 1 COMPLETE: Authentication works end-to-end!**

---

## Feature 2: 📋 Display Repository List

**Deliverable:** Dashboard shows all GitHub org repositories with basic info

### 2.1 Domain Layer - Repository Model (Minimal)
- [x] `src/domain/models/Repository.ts` - Basic repo (name, owner, url, description, language)
- [x] `src/domain/ports/IRepositoryProvider.ts` - Interface (listRepositories)
- [x] `src/domain/ports/ILogger.ts` - Interface (debug, info, warn, error)
- [x] Unit tests
- [x] ✅ **Checkpoint:** Domain models ready
- [x] **Commit:** "✨ Add Repository domain model"

### 2.2 Infrastructure - GitHub Integration
- [x] `src/infrastructure/lib/logger.ts` - ConsoleLogger implements ILogger
- [x] `src/infrastructure/adapters/github/OctokitClient.ts` - GitHub API wrapper
- [x] `src/infrastructure/adapters/github/mappers/RepositoryMapper.ts` - API → Domain
- [x] `src/infrastructure/adapters/github/GitHubRepositoryProvider.ts` - Implements IRepositoryProvider
- [x] Update `src/infrastructure/config/env.ts` - Add GITHUB_TOKEN, GITHUB_ORG
- [x] Integration tests
- [x] ✅ **Checkpoint:** Can fetch repos from GitHub API
- [x] **Commit:** "🔧 Implement GitHub repository provider"

### 2.3 Use Case - Fetch Repositories
- [x] `src/usecase/FetchRepositories.ts` - Constructor(provider, logger), execute(orgName)
- [x] Tests with mocked ports
- [x] ✅ **Checkpoint:** Use case orchestrates data fetching
- [x] **Commit:** "🎯 Add FetchRepositories use case"

### 2.4 API Route - Repositories Endpoint
- [x] `app/api/repositories/route.ts` - GET handler with dependency injection
- [x] Wire up: NextAuthProvider → GitHubProvider → FetchRepositories
- [x] Return JSON: { repositories: [] }
- [x] API tests
- [x] ✅ **Checkpoint:** API endpoint returns repo data
- [x] **Commit:** "🔌 Add repositories API endpoint"

### 2.5 UI - Repository Cards
- [x] `components/dashboard/RepositoryCard.tsx` - Card (name, description, language, click → GitHub)
- [x] `components/ui/Skeleton.tsx` - Loading skeleton
- [x] `components/ui/ErrorMessage.tsx` - Error state
- [x] Update `app/dashboard/page.tsx` - Fetch & display repos in grid
- [x] ✅ **Checkpoint:** Dashboard shows all repos!
- [x] **Commit:** "🗂️ Display repository list"

**✨ FEATURE 2 COMPLETE: Can see all organization repositories!**

---

## Feature 3: 📦 Add Release Information

**Deliverable:** Each repo card shows release count and latest release

### 3.1 Domain - Release Model
- [x] `src/domain/models/Release.ts` - Release (tagName, date, version), SemanticVersion, ReleaseStats
- [x] Update `src/domain/models/Repository.ts` - Add releases, releaseStats
- [x] `src/domain/services/ReleaseCalculator.ts` - calculateStats, filterSemanticVersions, calculateDaysSince
- [x] Unit tests
- [x] **Commit:** "✨ Add Release domain model"

### 3.2 Infrastructure - GitHub Releases
- [x] Update `src/domain/ports/IRepositoryProvider.ts` - Add getRepositoryTags()
- [x] `src/infrastructure/adapters/github/mappers/ReleaseMapper.ts` - GitHub tags → Release
- [x] Update `GitHubRepositoryProvider` - Implement getRepositoryTags()
- [x] Integration tests
- [x] **Commit:** "🔧 Add GitHub releases integration"

### 3.3 Use Case - Enrich with Releases
- [x] `src/usecase/FetchRepositoryData.ts` - Fetch repo + tags, calculate stats
- [x] Update `FetchRepositories` - Use FetchRepositoryData for each repo
- [x] Tests
- [x] **Commit:** "🎯 Add release data to repositories"

### 3.4 UI - Display Releases
- [x] Update `RepositoryCard` - Show total releases, latest version, "X days ago"
- [x] `lib/utils/formatters.ts` - formatDaysAgo(), formatDate()
- [x] **Commit:** "📦 Display release information"

**✨ FEATURE 3 COMPLETE: Release data visible on each card!**

---

## Feature 4: 📊 Add Build Statistics

**Deliverable:** Show CI/CD health (build success rate from GitHub Actions)

### 4.1 Domain - Build Model
- [ ] `src/domain/models/Build.ts` - BuildRun, BuildStats (successRate)
- [ ] Update `Repository` - Add buildStats
- [ ] `src/domain/services/BuildStatisticsCalculator.ts` - calculateStats, countSuccessful
- [ ] Unit tests
- [ ] **Commit:** "✨ Add Build domain model"

### 4.2 Infrastructure - GitHub Actions
- [ ] Update `IRepositoryProvider` - Add getWorkflowRuns()
- [ ] `src/infrastructure/adapters/github/mappers/BuildMapper.ts` - Actions → BuildRun
- [ ] Update `GitHubRepositoryProvider` - Implement getWorkflowRuns() with workflow name lookup
- [ ] Update `env.ts` - Add WORKFLOW_NAME
- [ ] Integration tests
- [ ] **Commit:** "🔧 Add GitHub Actions integration"

### 4.3 Use Case - Add Build Data
- [ ] Update `FetchRepositoryData` - Fetch workflow runs, calculate build stats
- [ ] Tests
- [ ] **Commit:** "🎯 Add build data to repositories"

### 4.4 UI - Display Build Stats
- [ ] Update `RepositoryCard` - Show success rate with color coding (green/yellow/red)
- [ ] `formatters.ts` - formatPercentage()
- [ ] **Commit:** "📊 Display build statistics"

**✨ FEATURE 4 COMPLETE: CI/CD health visible!**

---

## Feature 5: 📈 Add Release History Charts

**Deliverable:** Visual bar chart showing monthly releases per repository

### 5.1 Domain - Monthly Release Data
- [ ] Update `Release.ts` - Add MonthlyRelease interface
- [ ] Update `ReleaseCalculator` - calculateMonthlyBreakdown(releases, months)
- [ ] Unit tests
- [ ] **Commit:** "✨ Add monthly release calculation"

### 5.2 Use Case - Include Monthly Data
- [ ] Update `FetchRepositoryData` - Calculate monthly breakdown
- [ ] Tests
- [ ] **Commit:** "🎯 Add monthly data to use case"

### 5.3 UI - Integrate Chart.js
- [ ] `lib/chart/config.ts` - Chart.js configuration
- [ ] `lib/chart/transforms.ts` - transformMonthlyReleases() → Chart.js format
- [ ] `components/charts/ReleaseChart.tsx` - Bar chart component
- [ ] Update `RepositoryCard` - Add ReleaseChart (lazy loaded)
- [ ] **Commit:** "📈 Add release history charts"

**✨ FEATURE 5 COMPLETE: Visual release trends!**

---

## Feature 6: 👥 Add Activity Metrics

**Deliverable:** Show commits, contributors, code churn per repository

### 6.1 Domain - Activity Models
- [ ] `src/domain/models/Activity.ts` - Commit, CodeChurn
- [ ] `src/domain/models/Contributor.ts` - Contributor class
- [ ] Update `Repository` - Add commitCount, contributorCount, codeChurn
- [ ] `src/domain/services/ActivityAggregator.ts` - aggregateActivity()
- [ ] Unit tests
- [ ] **Commit:** "✨ Add Activity models"

### 6.2 Infrastructure - GitHub Activity
- [ ] Update `IRepositoryProvider` - Add getCommitActivity(), getContributors(), getCodeChurn()
- [ ] Update `GitHubRepositoryProvider` - Implement all three (handle 202 responses)
- [ ] Integration tests
- [ ] **Commit:** "🔧 Add GitHub activity integration"

### 6.3 Use Case - Add Activity Data
- [ ] Update `FetchRepositoryData` - Fetch activity, use ActivityAggregator
- [ ] Tests
- [ ] **Commit:** "🎯 Add activity data"

### 6.4 UI - Display Activity
- [ ] Update `RepositoryCard` - Show commits, contributors, code churn
- [ ] `formatters.ts` - formatNumber(), formatCodeChurn()
- [ ] **Commit:** "📊 Display activity metrics"

**✨ FEATURE 6 COMPLETE: Full repository insights!**

---

## Feature 7: 📊 Organization Overview

**Deliverable:** Dashboard header shows org-wide statistics

### 7.1 Domain - Organization Stats
- [ ] `src/domain/models/OrganizationStats.ts` - totalRepos, releasesThisMonth, avgBuildSuccess
- [ ] `src/domain/services/OrganizationStatsCalculator.ts` - calculate()
- [ ] Unit tests
- [ ] **Commit:** "✨ Add OrganizationStats model"

### 7.2 Use Case - Calculate Org Stats
- [ ] Update `FetchRepositories` - Calculate org stats, return { repositories, stats }
- [ ] Tests
- [ ] **Commit:** "🎯 Add org stats calculation"

### 7.3 API - Update Response
- [ ] Update `app/api/repositories/route.ts` - Return { repositories, stats, lastUpdated }
- [ ] **Commit:** "🔌 Include org stats in API"

### 7.4 UI - Statistics Header
- [ ] `components/dashboard/StatsSummary.tsx` - 3-column stats display
- [ ] `components/ui/StatCard.tsx` - Individual stat card
- [ ] `components/layout/DashboardLayout.tsx` - Layout with StatsSummary
- [ ] Update `app/dashboard/page.tsx` - Use DashboardLayout
- [ ] **Commit:** "📊 Add organization statistics header"

**✨ FEATURE 7 COMPLETE: Org-wide metrics visible!**

---

## Feature 8: 🔍 Search & Manual Refresh

**Deliverable:** Search repositories and force data refresh

### 8.1 Infrastructure - Cache Provider
- [ ] `src/domain/ports/ICacheProvider.ts` - Interface (get, set, invalidate, clear)
- [ ] `src/infrastructure/adapters/cache/InMemoryCacheProvider.ts` - Implements with TTL
- [ ] Unit tests
- [ ] **Commit:** "💾 Implement cache provider"

### 8.2 Use Case - Add Caching
- [ ] Update `FetchRepositories` - Check cache, add forceRefresh param
- [ ] Tests
- [ ] **Commit:** "🎯 Add caching to use case"

### 8.3 API - Cache Control
- [ ] Update `app/api/repositories/route.ts` - Wire cache, parse ?refresh=true
- [ ] **Commit:** "🔌 Add cache control to API"

### 8.4 UI - Search
- [ ] `components/dashboard/SearchBar.tsx` - Text input with clear button
- [ ] `hooks/useRepositoryFilter.ts` - Client-side filtering + sorting
- [ ] `hooks/useDebounce.ts` - 300ms debounce
- [ ] Update `app/dashboard/page.tsx` - Add SearchBar
- [ ] **Commit:** "🔍 Add search functionality"

### 8.5 UI - Manual Refresh
- [ ] `components/layout/Header.tsx` - Title, user, refresh button, last updated
- [ ] `hooks/useRepositoryData.ts` - Fetch data, refresh()
- [ ] `hooks/useKeyboardShortcut.ts` - Cmd/Ctrl + R
- [ ] `components/ui/Toast.tsx` - Success/error notifications
- [ ] Update `app/dashboard/page.tsx` - Use useRepositoryData, add Header
- [ ] **Commit:** "🔄 Add manual refresh"

**✨ FEATURE 8 COMPLETE: Search and refresh work!**

---

## Feature 9: ✨ Polish & Error Handling

**Deliverable:** Production-ready UI with comprehensive error states

### 9.1 UI Polish
- [ ] Update `RepositoryCard` - Hover effects, transitions, responsive
- [ ] `components/dashboard/EmptyState.tsx` - "No repositories" state
- [ ] `components/ErrorBoundary.tsx` - Catch React errors
- [ ] Accessibility: ARIA labels, keyboard nav, focus indicators
- [ ] **Commit:** "✨ Polish UI and accessibility"

### 9.2 Error Handling
- [ ] `src/infrastructure/lib/errors.ts` - Custom error classes
- [ ] Update `GitHubRepositoryProvider` - Retry logic, rate limits
- [ ] Update `FetchRepositoryData` - Handle errors gracefully
- [ ] Update `app/api/repositories/route.ts` - Proper HTTP codes, fallback to cache
- [ ] `app/api/health/route.ts` - Health check endpoint
- [ ] **Commit:** "🐛 Add comprehensive error handling"

**✨ FEATURE 9 COMPLETE: Polished and robust!**

---

## Feature 10: 🚀 Testing & Deployment

**Deliverable:** Production-ready with tests and Docker

### 10.1 Testing
- [ ] Verify domain tests pass (pure, no mocks)
- [ ] Verify use case tests pass (mocked ports)
- [ ] Verify infrastructure tests pass
- [ ] Install Playwright, add E2E tests (auth, dashboard, search, refresh)
- [ ] Manual testing with real GitHub org
- [ ] Create TESTING.md
- [ ] **Commit:** "🧪 Add comprehensive tests"

### 10.2 Docker
- [ ] Dockerfile (multi-stage, node:18-alpine, health check)
- [ ] docker-compose.yml
- [ ] .dockerignore
- [ ] .env.production.example
- [ ] Test Docker build and run
- [ ] **Commit:** "🐳 Add Docker configuration"

### 10.3 Production Optimization
- [ ] Update next.config.js - Security headers, standalone output
- [ ] `app/api/metrics/route.ts` - Uptime, memory, cache stats
- [ ] `scripts/startup.sh` - Env validation, graceful shutdown
- [ ] **Commit:** "🚀 Add production optimizations"

### 10.4 Documentation
- [ ] Update README.md - Features, setup, deployment
- [ ] Create ARCHITECTURE.md - Hexagonal architecture explained
- [ ] Create DEPLOYMENT.md - Deployment guide
- [ ] Create API.md - Endpoint documentation
- [ ] Create CHANGELOG.md - v1.0.0 release notes
- [ ] **Commit:** "📚 Complete documentation"

**✨ FEATURE 10 COMPLETE: Ready for production!**

---

## Architecture Verification (Check After Each Feature)

### ✅ Domain Layer (src/domain/)
- [ ] NO imports from Next.js, React, Octokit, or frameworks
- [ ] Models are pure TypeScript classes/interfaces
- [ ] Services are pure static functions
- [ ] Tests require NO mocking

### ✅ Use Case Layer (src/usecase/)
- [ ] Depends ONLY on domain ports (interfaces)
- [ ] NO concrete infrastructure implementations
- [ ] Tests use mocked ports only

### ✅ Infrastructure Layer (src/infrastructure/)
- [ ] Implements all domain ports
- [ ] All framework code here
- [ ] Converts DTOs to domain models

### ✅ API Routes (app/api/)
- [ ] Thin controllers with dependency injection
- [ ] NO business logic
- [ ] Handle HTTP concerns only

### ✅ UI Components (components/)
- [ ] Consume API endpoints
- [ ] Display domain model data
- [ ] NO business logic

---

## Progress Summary

- [x] **Phase 0:** Foundation ✅
- [ ] **Feature 1:** 🔐 Authentication (NEXT)
- [ ] **Feature 2:** 📋 Repository list
- [ ] **Feature 3:** 📦 Release info
- [ ] **Feature 4:** 📊 Build stats
- [ ] **Feature 5:** 📈 Release charts
- [ ] **Feature 6:** 👥 Activity metrics
- [ ] **Feature 7:** 📊 Org overview
- [ ] **Feature 8:** 🔍 Search & refresh
- [ ] **Feature 9:** ✨ Polish & errors
- [ ] **Feature 10:** 🚀 Testing & deployment

**Key Advantage:** After each feature, you have WORKING, VISIBLE functionality! No waiting until the end to see results.

---

**Last Updated:** 2025-12-29
