# Local Setup and Testing Guide

This guide provides step-by-step instructions for setting up and testing the Shopify Quiz Builder application locally.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Docker**: Version 20 or higher
- **Docker Compose**: Version 2 or higher
- **Git**: Latest version

### Verify Installations

```bash
# Check Node.js version
node --version  # Should be 18.x or higher

# Check npm version
npm --version   # Should be 8.x or higher

# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version
```

## Step 1: Clone and Setup Repository

### Clone the Repository
```bash
git clone <your-repository-url>
cd shopify-quiz-builder
```

### Install Dependencies
```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm run install:workspaces
```

## Step 2: Environment Configuration

### Create Environment Files
```bash
# Copy example environment files
cp env.example .env
cp packages/database/prisma/env.example packages/database/prisma/.env
```

### Configure Environment Variables

Edit `.env` file:
```bash
# Application
NODE_ENV=development
PORT=4000
JWT_SECRET=your_super_secret_jwt_key_here

# Database
DATABASE_URL=postgresql://quiz_builder_user:your_password@localhost:5432/shopify_quiz_builder?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# Shopify (for development)
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_customers,write_customers

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Allowed Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

Edit `packages/database/prisma/.env`:
```bash
DATABASE_URL=postgresql://quiz_builder_user:your_password@localhost:5432/shopify_quiz_builder?schema=public
```

## Step 3: Database Setup

### Start PostgreSQL with Docker
```bash
# Start only the database services
docker-compose up postgres redis -d

# Wait for services to be ready
sleep 10
```

### Create Database and User
```bash
# Connect to PostgreSQL
docker exec -it shopify-quiz-builder-postgres-1 psql -U postgres

# Create database and user
CREATE DATABASE shopify_quiz_builder;
CREATE USER quiz_builder_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE shopify_quiz_builder TO quiz_builder_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO quiz_builder_user;
ALTER USER quiz_builder_user CREATEDB;

# Exit psql
\q
```

### Run Database Migrations
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

## Step 4: Start Development Services

### Start All Services
```bash
# Start all services in development mode
docker-compose up -d
```

### Verify Services
```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f
```

## Step 5: Test Backend API

### Start Backend Development Server
```bash
# In a new terminal, start the API
cd apps/api
npm run start:dev
```

### Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:4000/api/v1/health

# Test API info
curl http://localhost:4000/api/v1/info

# Test monitoring endpoint
curl http://localhost:4000/api/v1/monitoring/health
```

### Expected Responses

**Health Endpoint:**
```json
{
  "data": {
    "status": "ok",
    "timestamp": "2024-01-XX...",
    "uptime": 123.45,
    "environment": "development",
    "version": "1.0.0"
  }
}
```

**API Info:**
```json
{
  "data": {
    "name": "Shopify Quiz Builder API",
    "description": "API for the Shopify Quiz Builder application",
    "version": "1.0.0",
    "environment": "development",
    "documentation": "/api/docs",
    "repository": "https://github.com/itairegev/shopify-quiz-builder"
  }
}
```

## Step 6: Test Frontend Admin

### Start Frontend Development Server
```bash
# In a new terminal, start the admin frontend
cd apps/admin
npm run dev
```

### Access Admin Interface
Open your browser and navigate to:
```
http://localhost:3000
```

### Expected Behavior
- Dashboard loads with sample data
- Polaris components render correctly
- Responsive design works on different screen sizes
- No console errors

## Step 7: Test Database Operations

### Open Prisma Studio
```bash
# In a new terminal
npm run db:studio
```

### Verify Database Content
- Navigate to `http://localhost:5555`
- Check that all tables are created
- Verify sample data is present
- Test basic CRUD operations

### Database Tables to Verify
- `shops` - Sample shop data
- `quizzes` - Sample quiz
- `questions` - Sample questions
- `logic_rules` - Sample logic rules
- `submissions` - Sample submission
- `answers` - Sample answers
- `analytics_events` - Sample analytics

## Step 8: Test Monitoring and Logging

### Check Logs
```bash
# View application logs
docker-compose logs -f api

# View database logs
docker-compose logs -f postgres
```

### Test Monitoring Dashboard
1. Navigate to the admin interface
2. Look for monitoring dashboard component
3. Verify health checks are working
4. Check metrics are being collected

### Expected Monitoring Data
- System health status
- Service health checks
- Performance metrics
- Database connection status

## Step 9: Integration Testing

### Test Frontend-Backend Communication
```bash
# Test API calls from frontend
# Check browser network tab for successful requests
# Verify CORS is working correctly
```

### Test Database Integration
```bash
# Verify database connections
# Test CRUD operations
# Check for any connection errors
```

## Step 10: Performance Testing

### Load Testing
```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:4000/api/v1/health"

# Create curl-format.txt file:
# time_namelookup:  %{time_namelookup}\n
# time_connect:     %{time_connect}\n
# time_appconnect:  %{time_appconnect}\n
# time_pretransfer: %{time_pretransfer}\n
# time_redirect:    %{time_redirect}\n
# time_starttransfer: %{time_starttransfer}\n
# time_total:       %{time_total}\n
```

### Memory Usage
```bash
# Check memory usage
docker stats shopify-quiz-builder-api-1
docker stats shopify-quiz-builder-admin-1
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify connection string
echo $DATABASE_URL
```

#### Port Conflicts
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :4000
lsof -i :5432

# Kill conflicting processes
kill -9 <PID>
```

#### Dependency Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
npm run install:workspaces
```

#### Docker Issues
```bash
# Restart Docker services
docker-compose down
docker-compose up -d

# Reset Docker containers
docker-compose down -v
docker-compose up -d
```

### Debug Mode

#### Enable Debug Logging
```bash
# Set debug environment variables
export DEBUG=*
export LOG_LEVEL=debug
```

#### Verbose Docker Logs
```bash
# Get detailed Docker logs
docker-compose logs -f --tail=100
```

## Development Workflow

### Making Changes
1. **Code Changes**: Edit files in your preferred editor
2. **Auto-reload**: Backend and frontend will auto-reload
3. **Database Changes**: Use Prisma migrations
4. **Testing**: Verify changes work as expected

### Git Workflow
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "feat: Description of changes"

# Push changes
git push origin feature/your-feature-branch
```

## Next Steps

After successful local setup:

1. **Verify All Tests Pass**: Run the test suite
2. **Check Code Quality**: Run linting and formatting
3. **Document Any Issues**: Note any problems encountered
4. **Plan Next Phase**: Move to Phase 2 (Core Backend Development)

## Support

If you encounter issues:

1. **Check Logs**: Review Docker and application logs
2. **Verify Configuration**: Ensure environment variables are correct
3. **Check Dependencies**: Verify all packages are installed
4. **Search Issues**: Check GitHub issues for similar problems
5. **Ask for Help**: Create a detailed issue with error logs

## Performance Benchmarks

### Expected Performance
- **API Response Time**: < 100ms for health checks
- **Database Queries**: < 50ms for simple queries
- **Frontend Load Time**: < 2s for dashboard
- **Memory Usage**: < 500MB per service

### Monitoring Thresholds
- **CPU Usage**: < 80%
- **Memory Usage**: < 80%
- **Disk Usage**: < 90%
- **Network Latency**: < 100ms

## Security Notes

### Development Security
- JWT secrets should be strong and unique
- Database passwords should be secure
- Environment files should never be committed
- Use HTTPS in production

### Data Protection
- Sample data is for development only
- No real customer data should be used
- Follow data protection best practices
- Regular security audits

