# WineSnap Gamified Deployment Guide

## Overview

This guide provides comprehensive instructions for safely deploying the gamified WineSnap version without interfering with the existing production deployment.

## Current Production Status

- **Live Site**: https://winesnap-oleov0698-helloemilywho-gmailcoms-projects.vercel.app
- **Features**: Voice recording system with WSET integration, Supabase database with wine tasting data, PWA with offline capabilities
- **Branch**: `main`

## New Gamified Version Features

- Complete redesign with Pokédex collections and Tamagotchi pets
- New database schema with gaming tables
- Enhanced voice/camera capture with gaming integration
- Social features and viral growth mechanics

## Deployment Architecture

```
Production (main)     ←→    Staging (staging/gamified-winesnap)
     ↓                            ↓
Live Production URL        Staging Test URL
     ↓                            ↓
Production Supabase        Staging Supabase
     ↓                            ↓
Production Database        Staging Database
```

## Prerequisites

### Required Tools
- Node.js 18+
- npm or yarn
- Vercel CLI: `npm install -g vercel`
- Supabase CLI (optional): https://supabase.com/docs/guides/cli
- Git

### Required Environment Variables

#### Production Environment
```env
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

#### Staging Environment
```env
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_STAGING_SUPABASE_URL=your_staging_supabase_url
NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY=your_staging_supabase_anon_key
STAGING_SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
```

## Deployment Process

### Phase 1: Staging Deployment

1. **Setup Environment**
   ```bash
   # Setup staging environment
   ./scripts/env-setup.sh setup-staging
   
   # Switch to staging environment
   ./scripts/env-setup.sh switch staging
   ```

2. **Deploy to Staging**
   ```bash
   # Automated staging deployment
   ./scripts/deploy-staging.sh
   
   # Or use GitHub Actions (recommended)
   git push origin staging/gamified-winesnap
   ```

3. **Validate Staging Environment**
   - Test all gaming features
   - Verify voice recording works
   - Check database migrations
   - Test offline functionality
   - Validate user authentication
   - Test performance under load

### Phase 2: Database Migration (If Required)

```bash
# Run database migration script
./scripts/database-migration.sh
```

### Phase 3: Production Deployment

⚠️ **Only proceed after thorough staging validation**

1. **Manual Deployment** (Recommended for first time)
   ```bash
   ./scripts/deploy-production.sh
   ```

2. **Automated Deployment via GitHub Actions**
   - Go to GitHub Actions
   - Run "Deploy to Production" workflow
   - Confirm staging has been validated
   - Monitor deployment progress

### Phase 4: Post-Deployment Verification

1. **Immediate Health Checks**
   - Site accessibility
   - User authentication
   - Database connectivity
   - API endpoints
   - Gaming features

2. **Extended Monitoring**
   - Monitor error rates for 24 hours
   - Check performance metrics
   - Validate user flows
   - Monitor database performance

## Rollback Procedures

### Emergency Rollback
If production issues are detected:

```bash
# Interactive rollback
./scripts/rollback.sh

# Quick rollback to latest backup
./scripts/rollback.sh quick
```

### Manual Rollback Steps
1. Access Vercel dashboard
2. Find previous stable deployment
3. Click "Promote to Production"
4. Verify site functionality

## Environment Management

### Switch Between Environments

```bash
# Development
./scripts/env-setup.sh switch dev

# Staging  
./scripts/env-setup.sh switch staging

# Production
./scripts/env-setup.sh switch prod
```

### Validate Environment Configuration

```bash
./scripts/env-setup.sh validate staging
./scripts/env-setup.sh validate production
```

## Monitoring and Alerts

### Key Metrics to Monitor
- Site availability (uptime)
- Response times
- Error rates
- Database query performance
- User authentication success rate
- Gaming feature usage

### Critical Alerts
- Site down (immediate alert)
- Error rate > 5%
- Response time > 3 seconds
- Database connection failures
- Authentication failures > 10%

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Environment Variable Issues
```bash
# Validate configuration
./scripts/env-setup.sh validate <environment>

# Reset environment
./scripts/env-setup.sh setup-<environment>
```

#### Database Connection Issues
1. Verify Supabase URLs and keys
2. Check network connectivity
3. Validate database schema
4. Review migration status

#### Vercel Deployment Issues
```bash
# Check deployment logs
vercel logs

# Redeploy
vercel --prod
```

## Security Considerations

### Environment Separation
- Use separate Supabase projects for staging/production
- Different API keys for each environment
- Isolated databases and storage

### Secret Management
- Store secrets in Vercel environment variables
- Never commit secrets to repository
- Rotate keys regularly
- Use least-privilege access

## Performance Optimization

### Deployment Optimizations
- Bundle analysis before deployment
- Image optimization enabled
- Caching strategies implemented
- CDN configuration optimized

### Database Optimizations
- Query performance monitoring
- Index optimization
- Connection pooling
- Regular maintenance

## Backup Strategy

### Automated Backups
- Git branches created before each deployment
- Database snapshots (manual recommendation)
- Environment configuration backups

### Backup Retention
- Keep last 5 deployment backups
- Monthly archive of major releases
- Critical configuration snapshots

## Team Responsibilities

### Deployment Lead
- Execute deployment scripts
- Monitor deployment progress  
- Coordinate rollback if needed
- Create deployment reports

### QA Team
- Validate staging environment
- Sign off on production readiness
- Test critical user flows
- Performance testing

### Development Team
- Code review and approval
- Database migration validation
- Feature flag configuration
- Bug fix prioritization

## Communication Plan

### Pre-Deployment
- Notify stakeholders of deployment window
- Share staging environment for testing
- Coordinate with customer support

### During Deployment
- Real-time status updates
- Monitor key metrics
- Immediate issue escalation

### Post-Deployment
- Deployment summary report
- Performance metrics review
- User feedback collection
- Next steps planning

## Success Criteria

### Technical KPIs
- Zero downtime deployment: ✅ Required
- Error rate < 1%: ✅ Required
- Response time < 2s: ✅ Required
- 100% feature functionality: ✅ Required

### Business KPIs
- User retention maintained
- Gaming feature adoption > 50%
- Voice recording success rate > 95%
- Mobile experience rating > 4.0

## Next Steps After Deployment

1. **24-Hour Monitoring Period**
   - Continuous monitoring
   - Quick response to issues
   - User feedback collection

2. **Week 1 Optimization**
   - Performance tuning
   - Bug fixes
   - User experience improvements

3. **Month 1 Analysis**
   - Feature usage analytics
   - Performance optimization
   - User feedback incorporation
   - Planning next iteration

## Contact Information

- **Deployment Issues**: Development Team
- **Production Outages**: Emergency Escalation
- **User Issues**: Customer Support
- **Business Questions**: Product Team

---

**Version**: 1.0  
**Last Updated**: $(date)  
**Next Review**: $(date -d "+1 month")