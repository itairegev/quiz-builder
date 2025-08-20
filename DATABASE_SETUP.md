# Database Setup Guide

## Overview
This guide covers setting up the PostgreSQL database for the Shopify Quiz Builder application.

## Prerequisites
- PostgreSQL 14+ installed and running
- Access to create databases and users
- Docker (optional, for containerized setup)

## Database Configuration

### 1. Create Database and User

Run the following SQL commands as a PostgreSQL superuser:

```sql
-- Create the database
CREATE DATABASE shopify_quiz_builder;

-- Create the user
CREATE USER quiz_builder_server_user WITH PASSWORD 'quiz_builder_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE shopify_quiz_builder TO quiz_builder_server_user;

-- Connect to the database
\c shopify_quiz_builder;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO quiz_builder_server_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO quiz_builder_server_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO quiz_builder_server_user;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO quiz_builder_server_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES IN SCHEMA public TO quiz_builder_server_user;
```

### 2. Environment Variables

Update your `.env` file with:

```bash
DATABASE_URL=postgresql://quiz_builder_server_user:quiz_builder_password@localhost:5432/shopify_quiz_builder?schema=public
```

### 3. Run Database Migrations

```bash
cd packages/database
npm run migrate
```

### 4. Seed the Database

```bash
npm run seed
```

## Database Schema

The application uses the following models:

- **Shop**: Shopify store information and authentication
- **Quiz**: Quiz definitions and settings
- **Question**: Individual quiz questions
- **LogicRule**: Conditional logic for quiz flow
- **Submission**: User quiz submissions
- **Answer**: Individual question answers
- **AnalyticsEvent**: User interaction tracking

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Check credentials in `.env` file
- Ensure database and user exist

### Migration Issues
- Reset database: `npm run db:reset`
- Check Prisma logs: `npm run db:studio`

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
```
