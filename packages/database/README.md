# Database Package

This package contains the database schema, Prisma configuration, and database services for the Shopify Quiz Builder application.

## Overview

The database is built using:
- **PostgreSQL** as the primary database
- **Prisma** as the ORM
- **NestJS** integration for dependency injection
- **Comprehensive schema** for quiz management and analytics

## Schema Overview

### Core Models

#### Shop
- Stores Shopify store information and authentication
- Manages access tokens and API scopes
- One-to-many relationship with quizzes

#### Quiz
- Quiz definitions and configurations
- Theme and settings stored as JSON
- Status management (draft, published, archived)
- One-to-many relationships with questions, logic rules, and submissions

#### Question
- Individual quiz questions
- Multiple question types (single choice, multiple choice, text, rating, etc.)
- Order management and validation rules
- Flexible options and settings via JSON

#### LogicRule
- Conditional logic for quiz flow
- Supports complex rule conditions
- Actions like show/hide questions, jump to questions
- Priority-based execution

#### Submission
- User quiz completion records
- Session management and metadata
- Status tracking (in progress, completed, abandoned)
- Analytics event relationships

#### Answer
- Individual question responses
- Flexible value storage (any data type)
- Metadata for analytics (time spent, confidence)
- Unique constraint per submission/question

#### AnalyticsEvent
- User interaction tracking
- Event types (quiz started, question answered, completed)
- Rich metadata for analysis
- Optional relationships to quizzes and submissions

## Setup

### Prerequisites
- PostgreSQL 14+
- Node.js 18+
- npm or yarn

### Installation
```bash
cd packages/database
npm install
```

### Environment Variables
Create a `.env` file in the `packages/database` directory:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/shopify_quiz_builder?schema=public"
```

### Generate Prisma Client
```bash
npm run generate
```

### Run Migrations
```bash
npm run migrate
```

### Seed Database
```bash
npm run seed
```

## Development Commands

```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed database
npm run seed

# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:reset

# Push schema changes (development)
npm run db:push

# Validate schema
npm run db:validate

# Format schema
npm run db:format
```

## Usage

### Basic Usage
```typescript
import { PrismaService } from '@shopify-quiz-builder/database';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(data: CreateQuizDto) {
    return this.prisma.quiz.create({
      data,
      include: {
        shop: true,
        questions: true,
      },
    });
  }

  async getQuizWithQuestions(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        logicRules: true,
      },
    });
  }
}
```

### Advanced Queries
```typescript
// Get quiz analytics
const analytics = await this.prisma.quiz.findUnique({
  where: { id: quizId },
  include: {
    submissions: {
      include: {
        answers: true,
        analyticsEvents: true,
      },
    },
    analyticsEvents: {
      where: {
        eventType: 'quiz_completed',
      },
    },
  },
});

// Get user submission history
const submissions = await this.prisma.submission.findMany({
  where: {
    sessionId: sessionId,
    status: 'COMPLETED',
  },
  include: {
    quiz: true,
    answers: {
      include: {
        question: true,
      },
    },
  },
});
```

## Database Design Principles

### 1. Flexibility
- JSON fields for settings and metadata
- Extensible question types
- Configurable logic rules

### 2. Performance
- Proper indexing on foreign keys
- Efficient relationship queries
- Optimized for read-heavy workloads

### 3. Scalability
- UUID primary keys (CUID)
- Partitioning-ready design
- Efficient query patterns

### 4. Data Integrity
- Foreign key constraints
- Unique constraints where needed
- Proper cascade rules

## Migration Strategy

### Development
- Use `npm run db:push` for rapid prototyping
- Schema changes are applied immediately

### Production
- Use `npm run migrate` for controlled deployments
- Migrations are versioned and tracked
- Rollback support for failed migrations

## Monitoring and Maintenance

### Health Checks
```typescript
// Check database connectivity
await this.prisma.$queryRaw`SELECT 1`;

// Check table sizes
const tableSizes = await this.prisma.$queryRaw`
  SELECT schemaname, tablename, attname, n_distinct
  FROM pg_stats
  WHERE schemaname = 'public'
`;
```

### Performance Optimization
- Monitor slow queries
- Add indexes for frequently accessed fields
- Use Prisma's query optimization features

## Troubleshooting

### Common Issues

#### Connection Errors
- Verify DATABASE_URL format
- Check PostgreSQL service status
- Verify user permissions

#### Migration Failures
- Check for schema conflicts
- Verify database user privileges
- Review migration logs

#### Performance Issues
- Analyze query execution plans
- Check index usage
- Monitor connection pool usage

### Getting Help
- Check Prisma documentation
- Review PostgreSQL logs
- Use Prisma Studio for debugging

## Future Enhancements

### Planned Features
- **Real-time subscriptions** for live quiz updates
- **Advanced analytics** with materialized views
- **Multi-tenant support** for enterprise customers
- **Audit logging** for compliance requirements

### Schema Evolution
- **Versioned migrations** for production safety
- **Backward compatibility** for API consumers
- **Data transformation** utilities for schema changes
