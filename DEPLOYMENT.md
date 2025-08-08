# Deployment Guide

This guide provides step-by-step instructions for deploying the Candidate Card Generator to production.

## 🚀 Pre-Deployment Checklist

### ✅ Environment Variables
- [ ] `VITE_OPENAI_API_KEY` is set and valid
- [ ] `VITE_APP_NAME` is configured
- [ ] `VITE_APP_VERSION` is set
- [ ] `VITE_APP_ENV` is set to "production"

### ✅ Code Quality
- [ ] All tests pass (`npm run test:run`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Error boundary is implemented
- [ ] Console logs are removed from production build

### ✅ Performance
- [ ] Bundle size is optimized
- [ ] Images are compressed
- [ ] Code splitting is configured
- [ ] Caching headers are set

### ✅ Security
- [ ] API keys are not exposed in client-side code
- [ ] Environment variables are properly configured
- [ ] HTTPS is enforced
- [ ] Security headers are set

## 🏗️ Build Process

### 1. Local Build Test

```bash
# Clean previous builds
npm run clean

# Install dependencies
npm install

# Run tests
npm run test:run

# Build for production
npm run build

# Preview production build
npm run preview
```

### 2. Build Verification

After building, verify:
- [ ] `dist/` folder contains all necessary files
- [ ] No console errors in browser
- [ ] All functionality works as expected
- [ ] PDF generation works correctly
- [ ] AI services are accessible

## 🚀 Deployment Platforms

### Vercel (Recommended)

#### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Environment Variables in Vercel
```bash
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_APP_NAME
vercel env add VITE_APP_VERSION
vercel env add VITE_APP_ENV
```

### Netlify

#### Automatic Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

#### Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### GitHub Pages

#### Using GitHub Actions
1. Create `.github/workflows/deploy.yml`
2. Configure GitHub Pages in repository settings
3. Push to trigger automatic deployment

#### Manual Deployment
```bash
# Build the project
npm run build

# Add, commit, and push dist folder
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

## 🔧 Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Application loads without errors
- [ ] Form inputs work correctly
- [ ] File uploads function properly
- [ ] AI services are accessible
- [ ] PDF generation works
- [ ] Recent cards save/load correctly

### ✅ Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Bundle size < 2MB
- [ ] Images load quickly
- [ ] No console errors

### ✅ Security Tests
- [ ] HTTPS is enforced
- [ ] API keys are not exposed
- [ ] No sensitive data in client-side code
- [ ] Error messages don't leak information

### ✅ Cross-Browser Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## 📊 Monitoring & Analytics

### Error Monitoring
Consider implementing:
- Sentry for error tracking
- Google Analytics for user behavior
- Performance monitoring

### Health Checks
- Set up uptime monitoring
- Configure error alerts
- Monitor API usage

## 🔄 Continuous Deployment

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
      - run: npm run preview &
      - run: sleep 10
      - run: curl -f http://localhost:4173 || exit 1
```

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version (>= 18.0.0)
- Clear node_modules and reinstall
- Verify all dependencies are installed

#### Environment Variables
- Ensure all required variables are set
- Check variable names (case-sensitive)
- Verify API keys are valid

#### Performance Issues
- Analyze bundle size with `npm run build:analyze`
- Optimize images and assets
- Check for memory leaks

#### API Errors
- Verify OpenAI API key is valid
- Check API rate limits
- Ensure network connectivity

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review build logs
3. Test locally first
4. Create an issue in the repository

## 🔄 Rollback Plan

### Quick Rollback
1. Revert to previous commit
2. Rebuild and redeploy
3. Verify functionality

### Database/Storage Rollback
- Recent cards are stored in localStorage
- No server-side data to rollback
- Consider backing up localStorage data

## 📋 Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor API usage
- [ ] Check for security updates
- [ ] Review performance metrics
- [ ] Update documentation

### Performance Monitoring
- [ ] Monitor Core Web Vitals
- [ ] Track bundle size
- [ ] Monitor API response times
- [ ] Check error rates 