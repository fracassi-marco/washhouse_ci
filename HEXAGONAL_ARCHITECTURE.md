# CI Dashboard - Hexagonal Architecture Guide

## Overview

This project follows Hexagonal Architecture (Ports and Adapters) principles to maintain clean separation between business logic and infrastructure concerns.

## Directory Structure

```
src/
├── domain/                    # Pure domain logic (no framework dependencies)
│   ├── models/               # Domain entities and value objects
│   │   ├── Repository.ts
│   │   ├── Release.ts
│   │   ├── Build.ts
│   │   ├── Activity.ts
│   │   └── OrganizationStats.ts
│   ├── ports/                # Repository interfaces (abstractions)
│   │   ├── IRepositoryProvider.ts
│   │   ├── ICacheProvider.ts
│   │   └── IAuthProvider.ts
│   └── services/             # Domain services (pure business logic)
│       ├── ReleaseCalculator.ts
│       ├── BuildStatistics.ts
│       └── ActivityAggregator.ts
│
├── usecase/                   # Application use cases (orchestration layer)
│   ├── FetchOrganizationData.ts
│   ├── RefreshRepositoryData.ts
│   ├── FilterRepositories.ts
│   └── CalculateOrganizationStats.ts
│
└── infrastructure/            # Framework and external dependencies
    ├── adapters/             # Implementations of domain ports
    │   ├── github/           # GitHub API adapter
    │   │   ├── GitHubRepositoryProvider.ts
    │   │   ├── OctokitClient.ts
    │   │   └── mappers/      # DTO to Domain mappers
    │   │       ├── RepositoryMapper.ts
    │   │       └── ReleaseMapper.ts
    │   ├── cache/            # Cache adapter
    │   │   └── InMemoryCacheProvider.ts
    │   └── auth/             # Authentication adapter
    │       └── NextAuthProvider.ts
    ├── config/               # Configuration
    │   ├── env.ts
    │   └── constants.ts
    └── lib/                  # Framework utilities
        ├── logger.ts
        └── errors.ts

app/                          # Next.js App Router (UI layer)
├── api/                      # API routes (thin controllers)
│   ├── auth/[...nextauth]/route.ts
│   └── repositories/route.ts
├── dashboard/
│   └── page.tsx
└── layout.tsx

components/                   # React components (presentation layer)
├── dashboard/
├── layout/
└── ui/

types/                        # Shared TypeScript types
└── index.ts
```

## Layer Responsibilities

### Domain Layer (`src/domain/`)

**Purpose**: Contains core business logic with zero framework dependencies.

**Contents**:
- **Models**: Pure domain entities (Repository, Release, Build, Activity)
- **Ports**: Interfaces that define contracts (IRepositoryProvider, ICacheProvider)
- **Services**: Pure business logic functions (calculations, validations, transformations)

**Rules**:
- ❌ NO imports from Next.js, React, Octokit, or any external library
- ✅ Only pure TypeScript/JavaScript
- ✅ Can import from other domain files
- ✅ Defines interfaces, not implementations

**Example**:
```typescript
// src/domain/ports/IRepositoryProvider.ts
export interface IRepositoryProvider {
  listRepositories(orgName: string): Promise<Repository[]>;
  getRepositoryTags(repoName: string): Promise<Tag[]>;
  getWorkflowRuns(repoName: string, workflowName: string): Promise<WorkflowRun[]>;
}

// src/domain/services/ReleaseCalculator.ts
export class ReleaseCalculator {
  static filterSemanticVersions(tags: Tag[]): Tag[] {
    const semverRegex = /^v\d+\.\d+\.\d+$/;
    return tags.filter(tag => semverRegex.test(tag.name));
  }
  
  static calculateMonthlyBreakdown(releases: Release[]): MonthlyRelease[] {
    // Pure calculation logic
  }
}
```

### Use Case Layer (`src/usecase/`)

**Purpose**: Orchestrates domain logic to fulfill application use cases.

**Contents**:
- Use case classes that coordinate domain services and ports
- Application-level business rules
- Transaction boundaries

**Rules**:
- ❌ NO framework-specific code (Next.js, React)
- ✅ Can depend on domain layer (models, ports, services)
- ✅ Receives port implementations via dependency injection
- ✅ Pure business orchestration

**Example**:
```typescript
// src/usecase/FetchOrganizationData.ts
export class FetchOrganizationData {
  constructor(
    private repositoryProvider: IRepositoryProvider,
    private cacheProvider: ICacheProvider
  ) {}
  
  async execute(orgName: string, forceRefresh: boolean = false): Promise<OrganizationData> {
    // Check cache
    if (!forceRefresh) {
      const cached = await this.cacheProvider.get(orgName);
      if (cached) return cached;
    }
    
    // Fetch from provider
    const repos = await this.repositoryProvider.listRepositories(orgName);
    
    // Process each repository (orchestration)
    const data = await Promise.all(
      repos.map(repo => this.fetchRepositoryData(repo))
    );
    
    // Calculate stats using domain services
    const stats = OrganizationStatsCalculator.calculate(data);
    
    // Cache results
    await this.cacheProvider.set(orgName, { data, stats });
    
    return { data, stats };
  }
}
```

### Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Concrete implementations of domain ports and framework-specific code.

**Contents**:
- **Adapters**: Implementations of port interfaces
- **Config**: Environment variables, configuration management
- **Lib**: Framework-specific utilities

**Rules**:
- ✅ Can import external libraries (Octokit, Next.js utilities)
- ✅ Implements domain port interfaces
- ✅ Handles external API communication
- ✅ Manages technical concerns (logging, error handling)

**Example**:
```typescript
// src/infrastructure/adapters/github/GitHubRepositoryProvider.ts
import { Octokit } from '@octokit/rest';
import { IRepositoryProvider } from '@/src/domain/ports/IRepositoryProvider';
import { Repository } from '@/src/domain/models/Repository';

export class GitHubRepositoryProvider implements IRepositoryProvider {
  private octokit: Octokit;
  
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }
  
  async listRepositories(orgName: string): Promise<Repository[]> {
    const { data } = await this.octokit.repos.listForOrg({ org: orgName });
    return data.map(RepositoryMapper.toDomain);
  }
}
```

## Dependency Flow

```
Infrastructure → Use Cases → Domain
     ↓              ↓          ↓
  (adapters)   (orchestration) (business logic)
  
UI Layer (Next.js/React) → Use Cases → Domain
                              ↓
                         Infrastructure
```

**Key Principles**:
1. Dependencies point inward (Infrastructure → Use Cases → Domain)
2. Domain knows nothing about infrastructure
3. Use cases depend on domain abstractions (ports), not implementations
4. Infrastructure provides concrete implementations

## Updated File Mapping

### Old Structure → New Hexagonal Structure

| Old Location | New Location | Layer |
|--------------|--------------|-------|
| `/lib/github/client.ts` | `src/infrastructure/adapters/github/OctokitClient.ts` | Infrastructure |
| `/lib/github/releases.ts` | `src/domain/services/ReleaseCalculator.ts` | Domain |
| `/lib/github/workflows.ts` | `src/infrastructure/adapters/github/WorkflowAdapter.ts` | Infrastructure |
| `/lib/github/activity.ts` | `src/infrastructure/adapters/github/ActivityAdapter.ts` | Infrastructure |
| `/lib/github/repository.ts` | `src/usecase/FetchRepositoryData.ts` | Use Case |
| `/lib/github/organization.ts` | `src/usecase/FetchOrganizationData.ts` | Use Case |
| `/lib/cache/memory-cache.ts` | `src/infrastructure/adapters/cache/InMemoryCacheProvider.ts` | Infrastructure |
| `/lib/auth.ts` | `src/infrastructure/adapters/auth/NextAuthProvider.ts` | Infrastructure |
| `/types/dashboard.ts` | `src/domain/models/*.ts` | Domain |

## Implementation Guidelines

### 1. Define Domain Models First

Start with pure domain models that represent your business entities:

```typescript
// src/domain/models/Repository.ts
export class Repository {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly url: string,
    public readonly releases: ReleaseStats,
    public readonly builds: BuildStats,
    public readonly activity: ActivityStats,
    public readonly contributors: ContributorStats,
    public readonly commitFrequency: CommitFrequency
  ) {}
}
```

### 2. Define Ports (Interfaces)

Create abstractions for external dependencies:

```typescript
// src/domain/ports/IRepositoryProvider.ts
export interface IRepositoryProvider {
  listRepositories(orgName: string): Promise<Repository[]>;
  getRepositoryTags(repoName: string): Promise<Tag[]>;
  getWorkflowRuns(repoName: string, workflowName: string): Promise<WorkflowRun[]>;
  getContributors(repoName: string): Promise<Contributor[]>;
  getCommitActivity(repoName: string, since: Date): Promise<CommitActivity>;
}
```

### 3. Implement Use Cases

Orchestrate domain logic without framework dependencies:

```typescript
// src/usecase/FetchOrganizationData.ts
export class FetchOrganizationData {
  constructor(
    private repositoryProvider: IRepositoryProvider,
    private cacheProvider: ICacheProvider,
    private logger: ILogger
  ) {}
  
  async execute(request: FetchOrganizationDataRequest): Promise<FetchOrganizationDataResponse> {
    // Business logic orchestration
  }
}
```

### 4. Implement Infrastructure Adapters

Provide concrete implementations of ports:

```typescript
// src/infrastructure/adapters/github/GitHubRepositoryProvider.ts
export class GitHubRepositoryProvider implements IRepositoryProvider {
  constructor(private octokit: Octokit) {}
  
  async listRepositories(orgName: string): Promise<Repository[]> {
    // Octokit-specific implementation
    // Maps GitHub API DTOs to domain models
  }
}
```

### 5. Wire Dependencies in API Routes

Next.js API routes act as thin controllers that wire up dependencies:

```typescript
// app/api/repositories/route.ts
import { FetchOrganizationData } from '@/src/usecase/FetchOrganizationData';
import { GitHubRepositoryProvider } from '@/src/infrastructure/adapters/github/GitHubRepositoryProvider';
import { InMemoryCacheProvider } from '@/src/infrastructure/adapters/cache/InMemoryCacheProvider';

export async function GET(request: Request) {
  // Dependency injection
  const repositoryProvider = new GitHubRepositoryProvider(process.env.GITHUB_TOKEN!);
  const cacheProvider = InMemoryCacheProvider.getInstance();
  
  const useCase = new FetchOrganizationData(repositoryProvider, cacheProvider);
  
  // Execute use case
  const result = await useCase.execute({
    orgName: process.env.GITHUB_ORG!,
    forceRefresh: searchParams.get('refresh') === 'true'
  });
  
  return Response.json(result);
}
```

## Testing Benefits

### Domain Layer Tests
- Pure unit tests with no mocking required
- Test business logic in isolation
- Fast and reliable

### Use Case Tests  
- Mock ports (interfaces) instead of concrete implementations
- Test orchestration logic
- Independent of infrastructure changes

### Infrastructure Tests
- Integration tests with real APIs (or mocked HTTP)
- Test adapter implementations
- Can test error handling and retries

## Migration Strategy

1. **Phase 1**: Create domain models and ports (interfaces)
2. **Phase 2**: Move business logic to domain services
3. **Phase 3**: Create use cases that orchestrate domain logic
4. **Phase 4**: Implement infrastructure adapters
5. **Phase 5**: Update API routes to use dependency injection
6. **Phase 6**: Update UI components to call use cases

## Benefits

✅ **Testability**: Domain logic can be tested without any framework
✅ **Flexibility**: Easy to swap GitHub API for another provider
✅ **Maintainability**: Clear separation of concerns
✅ **Reusability**: Domain logic can be reused across different UIs
✅ **Independence**: Framework changes don't affect business logic

## Anti-Patterns to Avoid

❌ **Don't** import Octokit in domain layer
❌ **Don't** import Next.js utilities in use cases
❌ **Don't** put business logic in API routes
❌ **Don't** let domain depend on infrastructure
❌ **Don't** bypass use cases from UI components

## Example: Complete Flow

**User Action**: Refresh dashboard

```
1. User clicks refresh button
   ↓
2. React component calls API route: /api/repositories?refresh=true
   ↓
3. API route creates use case instance with dependencies
   ↓
4. Use case: FetchOrganizationData.execute()
   ├─ Calls IRepositoryProvider.listRepositories()
   │  └─ Infrastructure: GitHubRepositoryProvider uses Octokit
   ├─ For each repo, orchestrates data fetching
   ├─ Calls domain services (ReleaseCalculator, etc.)
   └─ Calls ICacheProvider.set() to cache results
   ↓
5. API route returns JSON response
   ↓
6. React component updates UI
```

## Next Steps

1. Review [prompt_plan.md](prompt_plan.md) and adapt prompts to follow hexagonal architecture
2. Update [todo.md](todo.md) checklist items to reflect new structure
3. Create domain models and ports before any infrastructure code
4. Implement use cases with dependency injection
5. Build infrastructure adapters last
