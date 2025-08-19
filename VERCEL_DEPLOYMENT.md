# Vercel Deployment Guide

This guide explains how to deploy the Shopify Quiz Builder admin frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **Environment Variables**: Prepare your environment configuration

## Step 1: Connect Repository to Vercel

1. **Login to Vercel** and click "New Project"
2. **Import Git Repository**:
   - Select your GitHub account
   - Choose `shopify-quiz-builder` repository
   - Click "Import"

## Step 2: Configure Project Settings

### Project Configuration
- **Project Name**: `shopify-quiz-builder-admin`
- **Framework Preset**: Next.js
- **Root Directory**: `apps/admin`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment Variables
Add these environment variables in Vercel:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app

# Shopify Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
JWT_SECRET=your_jwt_secret_key

# Database Configuration (if needed)
DATABASE_URL=your_database_connection_string

# Third-party Services
KLAVIYO_API_KEY=your_klaviyo_api_key
MAILCHIMP_API_KEY=your_mailchimp_api_key
```

## Step 3: Configure Build Settings

### Build Configuration
- **Node.js Version**: 18.x or 20.x
- **Build Command**: `npm run build`
- **Install Command**: `npm install`

### Advanced Build Settings
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

## Step 4: Domain Configuration

### Custom Domain (Optional)
1. **Add Domain** in Vercel project settings
2. **Configure DNS** records as instructed
3. **SSL Certificate** will be automatically provisioned

### Default Vercel Domain
- Your app will be available at: `https://your-project.vercel.app`
- Update `NEXT_PUBLIC_APP_URL` with this domain

## Step 5: Deploy

1. **Push to Main Branch**: Vercel will auto-deploy
2. **Manual Deploy**: Use Vercel dashboard if needed
3. **Preview Deployments**: Created automatically for PRs

## Step 6: Verify Deployment

### Health Checks
- [ ] App loads without errors
- [ ] Shopify Polaris components render correctly
- [ ] API calls work (if backend is deployed)
- [ ] Responsive design works on mobile

### Performance Checks
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s

## Environment-Specific Deployments

### Development
- **Branch**: `develop`
- **Environment**: Development
- **Domain**: `dev-shopify-quiz-builder.vercel.app`

### Staging
- **Branch**: `staging`
- **Environment**: Staging
- **Domain**: `staging-shopify-quiz-builder.vercel.app`

### Production
- **Branch**: `main`
- **Environment**: Production
- **Domain**: `shopify-quiz-builder.vercel.app`

## Configuration Files

### vercel.json
The project includes a `vercel.json` configuration file that:
- Routes all traffic to the admin app
- Configures security headers
- Sets up environment variables
- Optimizes function execution time

### next.config.js
Next.js configuration optimized for:
- Shopify Polaris integration
- Package transpilation
- Image optimization
- Security headers

## Troubleshooting

### Common Issues

#### Build Failures
1. **Check Node.js version** (18.x or 20.x required)
2. **Verify dependencies** are properly installed
3. **Check build logs** for specific errors

#### Environment Variables
1. **Verify all required variables** are set
2. **Check variable names** match exactly
3. **Restart deployment** after adding variables

#### Routing Issues
1. **Check vercel.json** configuration
2. **Verify Next.js routing** is correct
3. **Test API routes** individually

### Performance Issues
1. **Enable Vercel Analytics** for insights
2. **Check bundle size** and optimize
3. **Use Vercel Edge Functions** for API routes

## Monitoring and Analytics

### Vercel Analytics
- **Enable Analytics** in project settings
- **Monitor performance** metrics
- **Track user behavior** and errors

### Error Tracking
- **Set up Sentry** integration
- **Monitor Vercel logs** for issues
- **Configure alerts** for critical errors

## Security Considerations

### Headers Configuration
The `vercel.json` includes security headers:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - Restricts browser features

### Environment Variables
- **Never commit secrets** to version control
- **Use Vercel's encrypted variables** for sensitive data
- **Rotate keys regularly** for security

## Cost Optimization

### Vercel Pricing
- **Hobby Plan**: Free for personal projects
- **Pro Plan**: $20/month for professional use
- **Enterprise Plan**: Custom pricing for large teams

### Optimization Tips
1. **Use Edge Functions** for API routes
2. **Optimize images** and assets
3. **Implement caching** strategies
4. **Monitor usage** and optimize accordingly

## Next Steps

After successful Vercel deployment:

1. **Test all functionality** thoroughly
2. **Configure monitoring** and alerts
3. **Set up CI/CD** for automatic deployments
4. **Prepare for backend integration**
5. **Plan Shopify app submission**

## Support

For Vercel-specific issues:
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: Available in dashboard
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

For project-specific issues:
- **Check project documentation**
- **Review GitHub issues**
- **Contact development team**
