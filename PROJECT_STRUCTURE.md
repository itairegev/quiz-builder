# Project Structure

This document outlines the planned structure for the Shopify Quiz Builder project.

## Repository Structure

```
shopify-quiz-builder/
├── .github/                    # GitHub configuration
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── workflows/             # GitHub Actions CI/CD
├── .documents/                 # Project documentation
├── apps/                       # Application packages
│   ├── admin/                 # Admin frontend (Next.js)
│   ├── api/                   # Backend API (NestJS)
│   └── storefront/            # Storefront component
├── packages/                   # Shared packages
│   ├── common/                # Shared utilities and types
│   ├── database/              # Database schema and migrations
│   └── ui/                    # Shared UI components
├── docs/                       # Technical documentation
├── scripts/                    # Build and deployment scripts
├── tests/                      # End-to-end tests
├── .env.example               # Environment variables template
├── docker-compose.yml         # Development environment
├── package.json               # Root package.json for monorepo
└── README.md                  # Project overview
```

## Branch Strategy

### Main Branches
- **`main`**: Production-ready code
- **`develop`**: Integration branch for features

### Feature Branches
- **`feature/task-{number}-{description}`**: Individual development tasks
- **`feature/{feature-name}`**: Feature development
- **`hotfix/{issue-description}`**: Critical bug fixes

### Branch Protection Rules
- **`main`**: Requires PR review, CI passing, and up-to-date with develop
- **`develop`**: Requires CI passing
- **Feature branches**: No restrictions, but should be kept up-to-date

## Development Workflow

1. **Create feature branch** from `develop`
2. **Develop and test** locally
3. **Push and create PR** to `develop`
4. **Code review** and approval
5. **Merge to develop** after CI passes
6. **Periodic releases** from `develop` to `main`

## Package Structure

### Admin App (`apps/admin/`)
- Next.js application for merchants
- Shopify Polaris design system
- Quiz builder interface
- Analytics dashboard

### API App (`apps/api/`)
- NestJS backend service
- Shopify API integration
- Database operations
- Third-party integrations

### Storefront Component (`apps/storefront/`)
- Web Component for customer-facing quizzes
- Multiple layout options
- Performance optimized
- Customizable via CSS/JS

### Shared Packages
- **Common**: Types, utilities, constants
- **Database**: Prisma schema, migrations, seeds
- **UI**: Reusable components, design tokens

## Environment Configuration

### Development
- Local PostgreSQL database
- Shopify development store
- Local environment variables

### Staging
- Staging database
- Shopify development store
- Staging environment variables

### Production
- Production database
- Shopify production stores
- Production environment variables

## Testing Strategy

- **Unit tests**: Individual components and functions
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Complete user workflows
- **Performance tests**: Load and stress testing

## Deployment

### Frontend (Vercel)
- Automatic deployment on main branch
- Preview deployments for PRs
- Global CDN distribution

### Backend (Heroku/AWS)
- Automatic deployment on main branch
- Health checks and monitoring
- Auto-scaling based on load

## Monitoring and Observability

- Application performance monitoring
- Error tracking and alerting
- User analytics and conversion tracking
- Infrastructure monitoring
