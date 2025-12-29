# CI Dashboard - Complete Technical Specification

## Project Overview
A Next.js web application that provides a comprehensive dashboard displaying statistics and metrics for all repositories in a GitHub organization. The dashboard will show release history, build statistics, contributor activity, and code metrics.

---

## 1. Technology Stack

### Frontend
- **Framework**: Next.js (latest stable version)
- **Styling**: Tailwind CSS
- **Charting**: Chart.js
- **Language**: TypeScript (recommended)

### Backend
- **API Routes**: Next.js API routes (server-side)
- **Authentication**: NextAuth.js with Google OAuth
- **Cache**: In-memory cache (Node.js)

### Deployment
- **Container**: Docker
- **Infrastructure**: Self-hosted

---

## 2. Authentication & Authorization

### Google OAuth Integration
- **Provider**: Google OAuth 2.0 via NextAuth.js
- **Session Management**: Standard Next.js session defaults
- **Implementation Requirements**:
  - Configure Google Cloud Console OAuth 2.0 credentials
  - Set up NextAuth.js with Google provider
  - Validate email domain on authentication callback
  - Redirect unauthorized users with appropriate error message

### Environment Variables Required
```
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
NEXTAUTH_URL=<your_app_url>
NEXTAUTH_SECRET=<random_secret_string>
GITHUB_TOKEN=<personal_access_token>
GITHUB_ORG=<organization_name>
```

---

## 3. GitHub API Integration

### Authentication
- **Method**: Personal Access Token (stored server-side)
- **Future Migration Path**: GitHub App (noted for future enhancement)
- **Token Permissions Required**:
  - `repo` (read access to repositories)
  - `workflow` (read access to GitHub Actions)

### API Endpoints to Use
1. **List Organization Repositories**: `GET /orgs/{org}/repos`
2. **List Repository Tags**: `GET /repos/{owner}/{repo}/tags`
3. **List Workflow Runs**: `GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs`
4. **Get Repository Contributors**: `GET /repos/{owner}/{repo}/contributors`
5. **Get Repository Statistics**: `GET /repos/{owner}/{repo}/stats/commit_activity`
6. **List Pull Requests**: `GET /repos/{owner}/{repo}/pulls?state=closed`
7. **Get Code Frequency**: `GET /repos/{owner}/{repo}/stats/code_frequency`

### Rate Limiting Considerations
- Personal Access Token: 5,000 requests/hour
- Implement exponential backoff for rate limit errors
- Cache data aggressively to minimize API calls

---

## 4. Data Collection & Processing

### Repository Data Collection
For each repository in the organization, collect:

#### Release Statistics
- **Source**: Git tags matching pattern `vX.Y.Z` (semantic versioning)
- **Data Points**:
  - Tag name
  - Tag creation date
  - Total count of releases in last 12 months
  - Monthly breakdown for chart visualization
  - Date of most recent release
  - Days since last release (calculated from current date)

#### Build Statistics
- **Source**: GitHub Actions workflow named "Build and Push to ECR"
- **Time Range**: Last 12 months
- **Filter**: Only successful runs
- **Data Points**:
  - Total number of successful builds
  - Total number of all builds (success + failure)
  - Success rate percentage: `(successful / total) * 100`

#### Repository Activity (Last 30 Days)
- **Total commits**: Count of all commits
- **Merged PRs**: Count of merged pull requests
- **Code churn**: Total lines added + total lines deleted

#### Contributor Metrics
- **Total contributors**: Count of unique contributors (all-time)

#### Commit Frequency
- **Metric**: Average commits per week
- **Calculation**: Total commits in last 30 days / 4.3 (average weeks per month)

---

## 5. Caching Strategy

### Cache Implementation
- **Storage**: In-memory (Node.js Map or similar)
- **TTL**: 15 minutes
- **Scope**: Organization-wide data cache

### Cache Structure
```typescript
interface CacheEntry {
  data: RepositoryData[];
  timestamp: number;
  organizationStats: OrganizationStats;
}
```

### Cache Invalidation
- **Automatic**: After 15 minutes from last fetch
- **Manual**: User-triggered refresh button bypasses cache
- **Server Restart**: Cache cleared (acceptable for this implementation)

### Cache Key
- Use organization name as cache key
- Single cache entry for entire organization

---

## 6. Data Models

### Repository Data Model
```typescript
interface RepositoryData {
  id: string;
  name: string;
  url: string; // GitHub repository URL
  
  // Release statistics
  releases: {
    total: number; // Total releases in last 12 months
    monthlyBreakdown: MonthlyRelease[]; // For chart
    lastReleaseDate: string | null; // ISO date string
    daysSinceLastRelease: number | null;
  };
  
  // Build statistics
  builds: {
    totalSuccessful: number; // Last 12 months
    totalAll: number; // Last 12 months
    successRate: number; // Percentage
  };
  
  // Activity metrics (last 30 days)
  activity: {
    commits: number;
    mergedPRs: number;
    linesAdded: number;
    linesDeleted: number;
  };
  
  // Contributors
  contributors: {
    total: number;
  };
  
  // Commit frequency
  commitFrequency: {
    averagePerWeek: number;
  };
}

interface MonthlyRelease {
  month: string; // Format: "2025-01", "2025-02", etc.
  count: number;
}

interface OrganizationStats {
  totalRepositories: number;
  releasesThisMonth: number;
  averageBuildSuccessRate: number; // Percentage
}
```

---

## 7. User Interface Specification

### Layout Structure

#### Header Section
- **Company/Organization Name** or **Dashboard Title**
- **User Profile** with logout option
- **Manual Refresh Button** (with loading indicator)
- **Last Updated Timestamp** (e.g., "Last updated: 2 minutes ago")

#### Summary Statistics Bar
Display organization-wide metrics prominently:
- Total number of repositories shown
- Total releases this month (across all repos)
- Average build success rate (across all repos)

#### Search & Filters
- **Search Bar**: Filter repositories by name (client-side, real-time)
- **Default Sort**: By number of releases in last 30 days (descending)

#### Repository Grid
- **Layout**: CSS Grid with responsive columns (e.g., 3-4 cards per row on desktop)
- **Card Design**: Each repository displayed as a card

### Repository Card Design

Each card should display:

#### Card Header
- **Repository Name** (linked to GitHub)
- Click anywhere on card opens GitHub repository in new tab

#### Release Chart
- **Chart Type**: Bar chart (Chart.js)
- **Data**: Monthly release count for last 12 months
- **X-Axis**: Month labels (e.g., "Jan", "Feb", etc.)
- **Y-Axis**: Number of releases
- **Styling**: Clean, minimal design

#### Metrics Display
Organize metrics into logical sections:

**Release Information**
- Last Release Date: `Dec 15, 2025` or `Never` if no releases
- Days Since Last Release: `14 days ago` or `N/A`

**Build Statistics**
- Total Successful Builds (last year): `145`
- Build Success Rate: `94.5%`

**Activity Metrics (Last 30 Days)**
- Commits: `87`
- Merged PRs: `12`
- Code Churn: `+2,345 / -1,234`

**Repository Metrics**
- Total Contributors: `8`
- Avg Commits/Week: `5.2`

### Styling Guidelines
- **Design**: Clean, professional, data-focused
- **Color Scheme**: Neutral with accent colors for charts
- **Typography**: Clear, readable fonts (system fonts acceptable)
- **Spacing**: Generous whitespace between cards and sections
- **Desktop-First**: Optimize for desktop viewing (1920x1080 and 2560x1440)
- **No Mobile Optimization Required**: Basic responsiveness acceptable but not priority

---

## 8. API Routes Architecture

### `/api/auth/[...nextauth]`
- **Purpose**: NextAuth.js dynamic route
- **Handles**: Google OAuth flow

### `/api/repositories`
- **Method**: GET
- **Authentication**: Required (NextAuth.js session)
- **Query Parameters**:
  - `refresh`: boolean (optional) - Force cache bypass
- **Response**: JSON array of `RepositoryData[]` + `OrganizationStats`
- **Process**:
  1. Check user authentication
  2. Check cache (unless `refresh=true`)
  3. If cache miss or refresh:
     - Fetch all repositories from GitHub org
     - For each repository (parallel where possible):
       - Fetch tags and filter by vX.Y.Z pattern
       - Fetch workflow runs for "Build and Push to ECR"
       - Fetch contributors
       - Fetch commit activity
       - Fetch merged PRs
       - Fetch code frequency
     - Process and aggregate data
     - Calculate organization-wide statistics
     - Store in cache
  4. Return data

### Error Handling in API Routes
- **GitHub API Errors**: Log error, skip problematic repository
- **Rate Limiting**: Return cached data if available, else return error message
- **Authentication Failures**: Return 401 Unauthorized
- **Server Errors**: Return 500 with generic error message

---

## 9. Error Handling Strategy

### Repository-Level Errors
**When to Skip Repository**:
- Repository doesn't have "Build and Push to ECR" workflow
- Repository has no tags matching vX.Y.Z pattern
- API errors fetching repository data
- Repository is empty or inaccessible

**Behavior**: Silently skip repository, don't display in dashboard, log error server-side

### Application-Level Errors
- **GitHub API Unreachable**: Display error banner, show stale cached data if available
- **Authentication Errors**: Redirect to login page
- **Data Refresh Failures**: Show error toast, maintain current view

### Logging
- Log all errors server-side with context (repository name, error type, timestamp)
- Include error details for debugging but don't expose to client

---

## 10. Performance Optimization

### Data Fetching
- **Parallel Requests**: Fetch repository data in parallel where possible
- **Batch Processing**: Process repositories in batches to avoid memory issues
- **Pagination**: Use GitHub API pagination for large organizations

### Frontend Optimization
- **Code Splitting**: Lazy load Chart.js components
- **Memoization**: Use React.memo for repository cards
- **Virtual Scrolling**: Consider if repository count > 100

### Caching Strategy
- 15-minute cache significantly reduces API calls
- In-memory cache is fast for reads
- Consider pre-warming cache on server startup

---

## 11. Security Considerations

### Token Security
- **Never expose GitHub token to client**
- Store in environment variables
- Access only from server-side code (API routes)

### OAuth Security
- Use HTTPS in production
- Validate domain restriction server-side (don't trust client)
- Implement CSRF protection (NextAuth.js handles this)

### API Security
- Validate user session on every API request
- Sanitize inputs (repository names in search)
- Rate limit API routes if needed

---

## 12. Development Workflow

### Project Setup
```bash
npx create-next-app@latest ci-dashboard --typescript --tailwind --app
cd ci-dashboard
npm install next-auth chart.js react-chartjs-2 @octokit/rest
```

### Environment Configuration
Create `.env.local`:
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GITHUB_TOKEN=
GITHUB_ORG=
```

### Development Steps
1. Set up NextAuth.js with Google provider and domain restriction
2. Create GitHub API service module with Octokit
3. Implement caching layer
4. Create `/api/repositories` endpoint with data aggregation logic
5. Build repository card component with Chart.js integration
6. Implement dashboard page with grid layout and search
7. Add summary statistics component
8. Implement manual refresh functionality
9. Style with Tailwind CSS
10. Test with real organization data

---

## 13. Testing Plan

### Unit Tests
- **GitHub API Service**: Mock Octokit responses, test data transformation
- **Cache Layer**: Test TTL, invalidation, refresh logic
- **Date Calculations**: Test "days since last release" logic
- **Data Aggregation**: Test organization statistics calculations

### Integration Tests
- **API Routes**: Test with mocked GitHub API
- **Authentication Flow**: Test domain restriction
- **Cache Behavior**: Test cache hit/miss scenarios

### Manual Testing Checklist
- [ ] Login with Google account succeeds
- [ ] Dashboard loads all repositories
- [ ] Repository cards display all metrics correctly
- [ ] Monthly release chart renders correctly
- [ ] Search filters repositories in real-time
- [ ] Repositories sorted by releases in last 30 days
- [ ] Clicking card opens GitHub repository
- [ ] Manual refresh button works and shows loading state
- [ ] Last updated timestamp updates after refresh
- [ ] Organization statistics calculate correctly
- [ ] Repositories without "Build and Push to ECR" workflow are skipped
- [ ] Repositories without vX.Y.Z tags are skipped
- [ ] Cache expires after 15 minutes
- [ ] Error scenarios handled gracefully

### Load Testing
- Test with organization containing 50+ repositories
- Verify API rate limits not exceeded
- Confirm acceptable page load times (< 5 seconds)

---

## 14. Deployment Configuration

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose (Optional)
```yaml
version: '3.8'
services:
  ci-dashboard:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
```

### Environment Variables (Production)
Ensure all environment variables are set in production:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL` (production URL)
- `NEXTAUTH_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_ORG`

### Deployment Steps
1. Build Docker image
2. Configure environment variables
3. Run container on infrastructure
4. Configure reverse proxy (nginx) if needed
5. Set up SSL/TLS certificates
6. Verify Google OAuth callback URLs in Google Cloud Console

---

## 15. Future Enhancements (Out of Scope)

These are noted for potential future development:
- Migration from Personal Access Token to GitHub App
- Historical data tracking (database storage)
- Customizable dashboard layouts
- Export functionality (CSV, PDF)
- Alerts and notifications
- Multiple organization support
- Additional workflow metrics
- Custom date range filters
- Mobile responsive design

---

## 16. Success Criteria

The project is complete when:
1. Dashboard successfully authenticates users with Google email
2. All repositories from GitHub organization are displayed
3. Each repository card shows all specified metrics accurately
4. Monthly release chart visualizes data correctly
5. Search functionality filters repositories
6. Manual refresh works and updates data
7. Organization-wide statistics display correctly
8. Application runs in Docker container
9. Data caches for 15 minutes
10. Repositories with missing data are skipped gracefully

---

## 17. Development Timeline Estimate

**Phase 1: Setup & Authentication (1-2 days)**
- Project setup, dependencies
- NextAuth.js configuration
- Google OAuth integration

**Phase 2: GitHub Integration (2-3 days)**
- GitHub API service implementation
- Data fetching logic
- Caching layer

**Phase 3: Frontend Development (2-3 days)**
- Dashboard layout
- Repository card component
- Chart integration
- Search functionality

**Phase 4: Testing & Refinement (1-2 days)**
- Manual testing
- Bug fixes
- Performance optimization

**Phase 5: Deployment (1 day)**
- Docker configuration
- Production deployment
- Final verification

**Total Estimated Time: 7-11 days** (for experienced Next.js developer)

---

## Appendix: Key Libraries Documentation

- **Next.js**: https://nextjs.org/docs
- **NextAuth.js**: https://next-auth.js.org/
- **Octokit (GitHub API)**: https://github.com/octokit/rest.js
- **Chart.js**: https://www.chartjs.org/docs/
- **react-chartjs-2**: https://react-chartjs-2.js.org/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Document Version**: 1.0  
**Last Updated**: December 29, 2025  
**Prepared For**: Development Team  
**Project Codename**: CI Dashboard
