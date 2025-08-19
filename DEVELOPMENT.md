# Development Setup Guide

This guide will help you set up the Shopify Quiz Builder development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/itairegev/shopify-quiz-builder.git
   cd shopify-quiz-builder
   ```

2. **Run the automated setup script**
   ```bash
   ./scripts/setup-dev.sh
   ```

   This script will:
   - Install all dependencies
   - Start Docker services
   - Set up the database
   - Seed with sample data

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## Manual Setup

If you prefer to set up manually or encounter issues with the automated script:

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm run install:workspaces
```

### 2. Start Docker Services

```bash
npm run docker:up
```

This starts:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Adminer database admin (port 8080)

### 3. Set Up Database

```bash
# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Configure Environment

Copy the environment template and configure:

```bash
cp env.example .env
```

Key variables to configure:
- `SHOPIFY_API_KEY` - Your Shopify app API key
- `SHOPIFY_API_SECRET` - Your Shopify app secret
- `JWT_SECRET` - Random string for JWT signing

### 5. Start Development Servers

```bash
# Start all services
npm run dev

# Or start individually:
npm run dev:admin      # Admin frontend (port 3000)
npm run dev:api        # Backend API (port 4000)
npm run dev:storefront # Storefront component (port 5000)
```

## Development Workflow

### Branch Strategy

1. **Create feature branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Develop and test** locally
3. **Push and create PR** to `develop`
4. **Code review** and approval
5. **Merge to develop** after CI passes

### Code Quality

- **Linting**: `npm run lint`
- **Type checking**: `npm run type-check`
- **Testing**: `npm run test`
- **Formatting**: Code is automatically formatted on save (if using VS Code)

## Project Structure

```
shopify-quiz-builder/
├── apps/                    # Application packages
│   ├── admin/              # Admin frontend (Next.js)
│   ├── api/                # Backend API (NestJS)
│   └── storefront/         # Storefront component
├── packages/                # Shared packages
│   ├── common/             # Shared utilities
│   ├── database/           # Database schema
│   └── ui/                 # Shared UI components
├── scripts/                 # Build and setup scripts
├── docs/                    # Documentation
└── tests/                   # End-to-end tests
```

## Useful Commands

### Docker Management
```bash
npm run docker:up      # Start all services
npm run docker:down    # Stop all services
npm run docker:logs    # View logs
npm run docker:restart # Restart services
npm run docker:clean   # Remove volumes and containers
```

### Database Management
```bash
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
```

### Development
```bash
npm run dev            # Start all dev servers
npm run build          # Build all packages
npm run test           # Run all tests
npm run lint           # Lint all code
npm run clean          # Clean everything
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 4000, 5000, 5432, 6379, and 8080 are available
2. **Docker issues**: Restart Docker Desktop and try again
3. **Database connection**: Wait for Docker services to fully start (may take 10-15 seconds)
4. **Permission issues**: Ensure the setup script is executable (`chmod +x scripts/setup-dev.sh`)

### Getting Help

- Check the [GitHub Issues](https://github.com/itairegev/shopify-quiz-builder/issues)
- Review the [Project Documentation](.documents/)
- Check Docker logs: `npm run docker:logs`

## Next Steps

After setting up the development environment:

1. **Set up Shopify Partner account** and create your app
2. **Configure app credentials** in your `.env` file
3. **Start building features** following the task breakdown in `.documents/tasks_and_stories.md`
4. **Join the development team** and contribute to the project

Happy coding! 🚀
