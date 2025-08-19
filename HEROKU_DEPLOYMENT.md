# Heroku Deployment Guide

This guide explains how to deploy the Shopify Quiz Builder backend API to Heroku.

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **GitHub Repository**: Ensure your code is pushed to GitHub
4. **PostgreSQL Database**: Will be provisioned through Heroku

## Step 1: Install Heroku CLI

### macOS
```bash
brew tap heroku/brew && brew install heroku
```

### Windows
Download installer from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

### Linux
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

## Step 2: Login to Heroku

```bash
heroku login
```

This will open your browser for authentication.

## Step 3: Create Heroku App

```bash
# Navigate to your project directory
cd shopify-quiz-builder

# Create a new Heroku app
heroku create your-app-name

# Or create with a specific name
heroku create shopify-quiz-builder-api
```

## Step 4: Add PostgreSQL Database

```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Verify the database was created
heroku config | grep DATABASE_URL
```

## Step 5: Configure Environment Variables

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=4000
heroku config:set JWT_SECRET=your_jwt_secret_key_here

# Shopify configuration
heroku config:set SHOPIFY_API_KEY=your_shopify_api_key
heroku config:set SHOPIFY_API_SECRET=your_shopify_api_secret
heroku config:set SHOPIFY_SCOPES=read_products,write_products,read_customers,write_customers

# API configuration
heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com

# Third-party services
heroku config:set KLAVIYO_API_KEY=your_klaviyo_api_key
heroku config:set MAILCHIMP_API_KEY=your_mailchimp_api_key
```

## Step 6: Configure Build Settings

### Set Node.js Version
```bash
# Create engines field in package.json (already done)
# Set the Node.js version in Heroku
heroku config:set NODE_VERSION=20.x
```

### Set Build Commands
```bash
# Set build command
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set NPM_CONFIG_PACKAGE_LOCK=true
```

## Step 7: Deploy the Application

### First Deployment
```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Push to Heroku
git push heroku main

# Or if you're on a different branch
git push heroku your-branch:main
```

### Subsequent Deployments
```bash
# Push changes
git push heroku main

# Or deploy from a specific branch
git push heroku develop:main
```

## Step 8: Run Database Migrations

```bash
# Run Prisma migrations
heroku run npm run prisma:migrate

# Generate Prisma client
heroku run npm run prisma:generate

# Seed database (if needed)
heroku run npm run prisma:seed
```

## Step 9: Verify Deployment

### Check App Status
```bash
# Open the app in browser
heroku open

# Check app logs
heroku logs --tail

# Check app info
heroku info
```

### Test Endpoints
```bash
# Test health endpoint
curl https://your-app-name.herokuapp.com/health

# Test API info
curl https://your-app-name.herokuapp.com/info
```

## Step 10: Configure Custom Domain (Optional)

```bash
# Add custom domain
heroku domains:add api.yourdomain.com

# Configure DNS records as instructed
# SSL certificate will be automatically provisioned
```

## Environment-Specific Deployments

### Development
```bash
# Create development app
heroku create shopify-quiz-builder-api-dev

# Set development environment
heroku config:set NODE_ENV=development
```

### Staging
```bash
# Create staging app
heroku create shopify-quiz-builder-api-staging

# Set staging environment
heroku config:set NODE_ENV=staging
```

### Production
```bash
# Create production app
heroku create shopify-quiz-builder-api-prod

# Set production environment
heroku config:set NODE_ENV=production
```

## Configuration Files

### Procfile
The project includes a `Procfile` that tells Heroku how to run the application:
```
web: npm run start:prod
```

### package.json Scripts
Ensure these scripts are available:
```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  }
}
```

## Monitoring and Logs

### View Logs
```bash
# Real-time logs
heroku logs --tail

# Recent logs
heroku logs --num 200

# Logs for specific time
heroku logs --since 1h
```

### Monitor Performance
```bash
# Check app status
heroku ps

# Monitor dyno usage
heroku ps:scale web=1
```

## Troubleshooting

### Common Issues

#### Build Failures
1. **Check Node.js version**: Ensure it matches your local version
2. **Verify dependencies**: Check package.json and package-lock.json
3. **Check build logs**: `heroku logs --tail` during deployment

#### Database Connection Issues
1. **Verify DATABASE_URL**: `heroku config | grep DATABASE_URL`
2. **Check Prisma setup**: Ensure migrations are run
3. **Verify database status**: `heroku addons:open heroku-postgresql`

#### Environment Variable Issues
1. **List all configs**: `heroku config`
2. **Check variable names**: Ensure they match your code
3. **Restart app**: `heroku restart`

### Performance Issues
1. **Scale dynos**: `heroku ps:scale web=2`
2. **Check memory usage**: Monitor in Heroku dashboard
3. **Optimize database queries**: Use Heroku Postgres insights

## Security Considerations

### Environment Variables
- **Never commit secrets** to version control
- **Use Heroku config vars** for sensitive data
- **Rotate keys regularly** for security

### Database Security
- **Use Heroku Postgres**: Automatically managed and secured
- **Enable SSL**: Required for production databases
- **Regular backups**: Configure automated backups

## Cost Optimization

### Heroku Pricing
- **Eco Dyno**: $5/month (sleeps after 30 min inactivity)
- **Basic Dyno**: $7/month (always on)
- **Standard Dyno**: $25/month (better performance)

### Database Pricing
- **Mini**: $5/month (up to 1GB)
- **Basic**: $9/month (up to 1GB, better performance)
- **Standard**: $50/month (up to 64GB)

### Optimization Tips
1. **Use Eco dynos** for development/staging
2. **Scale down** during low usage periods
3. **Monitor usage** and optimize accordingly

## Next Steps

After successful Heroku deployment:

1. **Test all API endpoints** thoroughly
2. **Configure monitoring** and alerts
3. **Set up CI/CD** for automatic deployments
4. **Integrate with frontend** (Vercel)
5. **Configure Shopify webhooks**
6. **Set up error tracking** (Sentry)

## Support

For Heroku-specific issues:
- **Heroku Documentation**: [devcenter.heroku.com](https://devcenter.heroku.com)
- **Heroku Support**: Available in dashboard
- **Community**: [help.heroku.com](https://help.heroku.com)

For project-specific issues:
- **Check project documentation**
- **Review GitHub issues**
- **Contact development team**

## Useful Heroku Commands

```bash
# App management
heroku apps                    # List all apps
heroku info                    # App information
heroku open                    # Open app in browser
heroku restart                 # Restart app

# Configuration
heroku config                  # View all config vars
heroku config:set KEY=value   # Set config var
heroku config:unset KEY       # Remove config var

# Logs and monitoring
heroku logs --tail            # Real-time logs
heroku ps                     # Dyno status
heroku ps:scale web=2        # Scale dynos

# Database
heroku addons:open heroku-postgresql  # Open database dashboard
heroku pg:info               # Database information
heroku pg:backups:capture    # Create backup

# Maintenance
heroku maintenance:on         # Enable maintenance mode
heroku maintenance:off        # Disable maintenance mode
```
