# Database Setup Guide

This guide explains how to set up and configure the PostgreSQL database for the Shopify Quiz Builder application.

## Prerequisites

1. **PostgreSQL**: Version 13 or higher
2. **Node.js**: Version 18 or higher
3. **Prisma CLI**: Will be installed as a dependency

## Local Development Setup

### Step 1: Install PostgreSQL

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Or using Postgres.app
# Download from https://postgresapp.com/
```

#### Windows
```bash
# Download installer from https://www.postgresql.org/download/windows/
# Or use WSL with Ubuntu
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE shopify_quiz_builder;
CREATE USER quiz_builder_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE shopify_quiz_builder TO quiz_builder_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO quiz_builder_user;
ALTER USER quiz_builder_user CREATEDB;

# Exit psql
\q
```

### Step 3: Configure Environment Variables

Copy the example environment file:
```bash
cd packages/database
cp prisma/env.example .env
```

Edit `.env` with your database credentials:
```bash
DATABASE_URL="postgresql://quiz_builder_user:your_secure_password@localhost:5432/shopify_quiz_builder?schema=public"
```

### Step 4: Install Dependencies

```bash
# From project root
npm install

# Or from database package
cd packages/database
npm install
```

### Step 5: Generate Prisma Client

```bash
# From database package
npm run generate

# Or from project root
npm run db:generate
```

### Step 6: Run Database Migrations

```bash
# Create and apply initial migration
npm run migrate

# Or from project root
npm run db:migrate
```

### Step 7: Seed Database (Optional)

```bash
# Seed with sample data
npm run seed

# Or from project root
npm run db:seed
```

## Production Database Setup

### Option 1: Heroku Postgres

```bash
# Add PostgreSQL addon to your Heroku app
heroku addons:create heroku-postgresql:mini

# Get the database URL
heroku config | grep DATABASE_URL

# Set environment variable in your app
heroku config:set DATABASE_URL="your_heroku_database_url"
```

### Option 2: AWS RDS

1. **Create RDS Instance**:
   - Engine: PostgreSQL
   - Version: 13 or higher
   - Instance: db.t3.micro (free tier) or larger
   - Storage: 20GB minimum

2. **Configure Security Group**:
   - Allow inbound traffic on port 5432
   - Restrict to your application's IP range

3. **Set Environment Variables**:
   ```bash
   DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/shopify_quiz_builder?sslmode=require"
   ```

### Option 3: DigitalOcean Managed Database

1. **Create Database Cluster**:
   - Choose PostgreSQL
   - Select region close to your application
   - Choose plan based on your needs

2. **Configure Connection**:
   - Use the provided connection string
   - Enable SSL connections

### Option 4: Supabase (Free Tier)

1. **Create Project**:
   - Sign up at [supabase.com](https://supabase.com)
   - Create new project

2. **Get Connection String**:
   - Go to Settings > Database
   - Copy the connection string

3. **Configure Environment**:
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

## Database Schema

### Core Tables

- **shops**: Shopify store information
- **quizzes**: Quiz configurations and settings
- **questions**: Individual quiz questions
- **logic_rules**: Conditional logic for quiz flow
- **submissions**: Quiz completion records
- **answers**: Individual question responses
- **analytics_events**: User interaction tracking

### Key Features

- **UUID Primary Keys**: Using CUID for better distribution
- **JSON Fields**: Flexible storage for settings and metadata
- **Timestamps**: Automatic created/updated tracking
- **Relationships**: Proper foreign key constraints
- **Indexes**: Performance optimization for queries

## Database Management

### Prisma Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create and apply migrations
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Open Prisma Studio
npm run db:studio

# Reset database (development only)
npm run db:reset

# Format schema file
npm run db:format

# Validate schema
npm run db:validate
```

### Database Monitoring

```bash
# Check database status
npm run db:status

# View database logs
npm run db:logs

# Monitor performance
npm run db:monitor
```

## Performance Optimization

### Connection Pooling

```bash
# Configure connection pool size
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### Indexing Strategy

- **Primary Keys**: Automatically indexed
- **Foreign Keys**: Automatically indexed
- **Frequently Queried Fields**: Add custom indexes
- **JSON Fields**: Use GIN indexes for complex queries

### Query Optimization

- Use Prisma's built-in query optimization
- Implement pagination for large datasets
- Use select() to limit returned fields
- Leverage Prisma's relation loading

## Backup and Recovery

### Automated Backups

```bash
# Create backup
pg_dump shopify_quiz_builder > backup.sql

# Restore from backup
psql shopify_quiz_builder < backup.sql
```

### Heroku Backups

```bash
# Capture backup
heroku pg:backups:capture

# Download backup
heroku pg:backups:download

# Restore backup
heroku pg:backups:restore b001 DATABASE_URL
```

## Security Considerations

### Environment Variables

- **Never commit** `.env` files to version control
- Use strong, unique passwords
- Rotate credentials regularly
- Use different credentials for each environment

### Database Access

- **Restrict network access** to application servers only
- Use SSL connections in production
- Implement connection pooling
- Monitor for suspicious activity

### Data Protection

- **Encrypt sensitive data** at rest
- Implement proper access controls
- Regular security audits
- Compliance with data protection regulations

## Troubleshooting

### Common Issues

#### Connection Errors
1. **Check database status**: Ensure PostgreSQL is running
2. **Verify credentials**: Check username/password
3. **Network access**: Ensure firewall allows connections
4. **SSL configuration**: Verify SSL settings for production

#### Migration Issues
1. **Check Prisma version**: Ensure compatibility
2. **Verify schema**: Check for syntax errors
3. **Database permissions**: Ensure user has required privileges
4. **Conflict resolution**: Handle schema conflicts manually if needed

#### Performance Issues
1. **Connection pooling**: Optimize pool size
2. **Query optimization**: Use Prisma's query analysis
3. **Indexing**: Add appropriate indexes
4. **Monitoring**: Use database monitoring tools

### Getting Help

- **Prisma Documentation**: [prisma.io/docs](https://prisma.io/docs)
- **PostgreSQL Documentation**: [postgresql.org/docs](https://postgresql.org/docs)
- **Community Support**: Stack Overflow, GitHub Discussions
- **Professional Support**: Database consultants, cloud provider support

## Next Steps

After successful database setup:

1. **Test connections** from your application
2. **Run migrations** to create tables
3. **Seed with sample data** for development
4. **Configure monitoring** and alerting
5. **Set up backup schedules**
6. **Plan scaling strategy** for production

## Environment-Specific Configurations

### Development
```bash
DATABASE_URL="postgresql://localhost:5432/shopify_quiz_builder_dev"
DATABASE_POOL_MIN=1
DATABASE_POOL_MAX=5
```

### Staging
```bash
DATABASE_URL="postgresql://staging-db.example.com:5432/shopify_quiz_builder_staging"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### Production
```bash
DATABASE_URL="postgresql://prod-db.example.com:5432/shopify_quiz_builder_prod"
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_SSL_MODE=require
```
