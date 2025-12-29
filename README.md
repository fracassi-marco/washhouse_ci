# CI Dashboard

A Next.js dashboard for monitoring GitHub repository CI/CD metrics, releases, and activity.

## Architecture

This project follows **Hexagonal Architecture** (also known as Ports and Adapters pattern) to maintain clean separation of concerns and testability.

### Folder Structure

```
src/
├── domain/           # Pure business logic (NO framework dependencies)
│   ├── models/       # Domain entities and value objects
│   ├── ports/        # Interfaces for external dependencies
│   └── services/     # Domain services with business rules
├── usecase/          # Application use cases (orchestration layer)
└── infrastructure/   # Framework and library implementations
    ├── adapters/     # Concrete implementations of domain ports
    │   ├── github/   # GitHub API adapter
    │   ├── cache/    # Cache provider adapter
    │   └── auth/     # Authentication adapter
    ├── config/       # Configuration files
    └── lib/          # Infrastructure utilities

app/                  # Next.js App Router pages
components/           # React components
```

### Key Principles

1. **Domain Layer**: Pure TypeScript with zero framework dependencies
2. **Use Case Layer**: Orchestrates domain services, framework-agnostic
3. **Infrastructure Layer**: All framework/library code lives here
4. **Dependency Flow**: Infrastructure → Use Cases → Domain (never reverse)

For detailed architecture documentation, see [HEXAGONAL_ARCHITECTURE.md](./HEXAGONAL_ARCHITECTURE.md).

## Overview

This dashboard provides a comprehensive view of your organization's repositories including:
- Release history and statistics
- Build success rates from GitHub Actions
- Repository activity metrics
- Contributor information
- Monthly release charts

## Features

- **Authentication**: Google OAuth (optional, controlled by feature flag)
- **Real-time Data**: GitHub API integration with intelligent caching
- **Visual Charts**: Monthly release history visualization
- **Search & Filter**: Quick repository search functionality
- **Manual Refresh**: On-demand data updates
- **Responsive Design**: Desktop-first UI with Tailwind CSS

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- NextAuth.js
- GitHub API (Octokit)
- Chart.js
- Docker

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub Personal Access Token
- Google OAuth credentials (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fracassi-marco/washhouse_ci.git
   cd washhouse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual values
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

See [.env.local.example](./.env.local.example) for required variables:
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GITHUB_TOKEN` - GitHub personal access token
- `GITHUB_ORG` - GitHub organization name

## Project Status

🚧 **In Development** - Phase 1: Domain Layer Implementation

## License

*To be determined*
