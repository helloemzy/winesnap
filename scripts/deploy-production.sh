#!/bin/bash

# WineSnap Production Deployment Script
# This script safely promotes the validated staging version to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STAGING_BRANCH="staging/gamified-winesnap"
PRODUCTION_BRANCH="main"
BACKUP_BRANCH="backup/pre-gamified-$(date +%Y%m%d_%H%M%S)"

echo -e "${BLUE}🚀 WineSnap Production Deployment${NC}"
echo "================================="

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: Not in project root directory${NC}"
        exit 1
    fi
    
    # Check if staging URL exists (validation step)
    if [ ! -f ".staging-url" ]; then
        echo -e "${RED}❌ Error: No staging deployment found. Run deploy-staging.sh first${NC}"
        exit 1
    fi
    
    # Confirm staging has been tested
    echo -e "${YELLOW}⚠️  Have you thoroughly tested the staging environment?${NC}"
    read -p "Continue with production deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        exit 0
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to create backup
create_backup() {
    echo -e "${YELLOW}📦 Creating production backup...${NC}"
    
    # Switch to production branch
    git checkout "$PRODUCTION_BRANCH"
    
    # Create backup branch from current production
    git checkout -b "$BACKUP_BRANCH"
    git push origin "$BACKUP_BRANCH" || {
        echo -e "${YELLOW}⚠️  Could not push backup branch (continuing...)${NC}"
    }
    
    echo -e "${GREEN}✅ Backup created: $BACKUP_BRANCH${NC}"
}

# Function to merge staging to production
merge_staging() {
    echo -e "${YELLOW}🔄 Merging staging to production...${NC}"
    
    # Switch back to production branch
    git checkout "$PRODUCTION_BRANCH"
    
    # Pull latest changes
    git pull origin "$PRODUCTION_BRANCH"
    
    # Merge staging branch
    git merge "$STAGING_BRANCH" --no-ff -m "feat: Deploy gamified WineSnap to production

- Complete redesign with Pokédex collections and Tamagotchi pets
- New database schema with gaming tables
- Enhanced voice/camera capture with gaming integration
- Social features and viral growth mechanics
- Maintained backward compatibility with existing data

🚀 Deployed from staging: $(cat .staging-url 2>/dev/null || echo 'staging environment')

🤖 Generated with Claude Code" || {
        echo -e "${RED}❌ Merge conflicts detected. Please resolve manually.${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Staging merged to production${NC}"
}

# Function to deploy to production
deploy_to_production() {
    echo -e "${YELLOW}🚀 Deploying to production...${NC}"
    
    # Push to production branch
    git push origin "$PRODUCTION_BRANCH"
    
    # Deploy using production environment
    vercel --prod --env NEXT_PUBLIC_APP_ENV=production || {
        echo -e "${RED}❌ Production deployment failed${NC}"
        rollback
        exit 1
    }
    
    echo -e "${GREEN}✅ Production deployment completed${NC}"
}

# Function to rollback if needed
rollback() {
    echo -e "${YELLOW}🔄 Rolling back production...${NC}"
    
    # Reset to backup
    git reset --hard "$BACKUP_BRANCH"
    git push origin "$PRODUCTION_BRANCH" --force
    
    # Redeploy previous version
    vercel --prod --env NEXT_PUBLIC_APP_ENV=production
    
    echo -e "${YELLOW}⚠️  Production rolled back to backup${NC}"
}

# Function to run post-deployment verification
verify_production() {
    echo -e "${YELLOW}🔍 Verifying production deployment...${NC}"
    
    # Get production URL
    PRODUCTION_URL="https://winesnap-oleov0698-helloemilywho-gmailcoms-projects.vercel.app"
    
    # Wait for deployment to be ready
    echo "Waiting for deployment to stabilize..."
    sleep 30
    
    # Check if the site responds
    if curl -f -s "$PRODUCTION_URL" > /dev/null; then
        echo -e "${GREEN}✅ Production site is responding${NC}"
    else
        echo -e "${RED}❌ Production site not responding${NC}"
        rollback
        exit 1
    fi
    
    # Additional health checks could be added here
    # - Database connectivity
    # - API endpoints
    # - Critical user flows
    
    echo -e "${GREEN}✅ Production verification completed${NC}"
}

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    # Remove staging URL file
    rm -f .staging-url
    
    # Clean up old backup branches (keep last 5)
    echo "Cleaning up old backup branches..."
    git branch -r | grep "origin/backup/pre-gamified-" | sort -r | tail -n +6 | while read branch; do
        branch_name=$(echo $branch | sed 's/origin\///')
        git push origin --delete "$branch_name" 2>/dev/null || true
    done
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to create deployment summary
create_summary() {
    echo -e "${BLUE}📊 Production Deployment Summary${NC}"
    echo "================================="
    
    echo -e "Production URL: ${GREEN}https://winesnap-oleov0698-helloemilywho-gmailcoms-projects.vercel.app${NC}"
    echo -e "Branch: ${GREEN}$PRODUCTION_BRANCH${NC}"
    echo -e "Environment: ${GREEN}production${NC}"
    echo -e "Backup: ${GREEN}$BACKUP_BRANCH${NC}"
    echo -e "Deployment time: ${GREEN}$(date)${NC}"
    
    echo ""
    echo -e "${YELLOW}Post-deployment tasks:${NC}"
    echo "1. Monitor application logs and metrics"
    echo "2. Verify user authentication and data integrity"
    echo "3. Test critical user flows"
    echo "4. Monitor error rates and performance"
    echo "5. Communicate deployment to stakeholders"
    
    echo ""
    echo -e "${GREEN}🎉 Gamified WineSnap is now live in production!${NC}"
}

# Main deployment flow
main() {
    check_prerequisites
    create_backup
    merge_staging
    deploy_to_production
    verify_production
    cleanup
    create_summary
    
    echo -e "${GREEN}🎉 Production deployment completed successfully!${NC}"
}

# Error handler
error_handler() {
    echo -e "${RED}❌ Production deployment failed. Initiating rollback...${NC}"
    rollback
    exit 1
}

# Set up error handling
trap error_handler ERR

# Run main deployment
main