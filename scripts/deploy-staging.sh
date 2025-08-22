#!/bin/bash

# WineSnap Staging Deployment Script
# This script safely deploys the gamified version to staging without affecting production

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
PROJECT_NAME="winesnap-staging"

echo -e "${BLUE}🚀 WineSnap Staging Deployment${NC}"
echo "==============================="

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: Not in project root directory${NC}"
        exit 1
    fi
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Error: Vercel CLI not found. Install with: npm i -g vercel${NC}"
        exit 1
    fi
    
    # Check if we're on the correct branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "$STAGING_BRANCH" ]; then
        echo -e "${YELLOW}⚠️  Switching to staging branch: $STAGING_BRANCH${NC}"
        git checkout "$STAGING_BRANCH" || {
            echo -e "${RED}❌ Failed to switch to staging branch${NC}"
            exit 1
        }
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to run pre-deployment tests
run_tests() {
    echo -e "${YELLOW}🧪 Running pre-deployment tests...${NC}"
    
    # Install dependencies
    npm ci || {
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    }
    
    # Run linting
    npm run lint || {
        echo -e "${YELLOW}⚠️  Linting issues found, continuing...${NC}"
    }
    
    # Build the project to catch any build errors
    npm run build || {
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Tests passed${NC}"
}

# Function to deploy to Vercel staging
deploy_to_staging() {
    echo -e "${YELLOW}🚀 Deploying to Vercel staging...${NC}"
    
    # Set staging environment variables
    vercel env add NEXT_PUBLIC_APP_ENV staging || true
    vercel env add NEXT_PUBLIC_ENABLE_GAMING_FEATURES true || true
    vercel env add NEXT_PUBLIC_ENABLE_PET_SYSTEM true || true
    vercel env add NEXT_PUBLIC_ENABLE_VIRAL_FEATURES true || true
    
    # Deploy to staging with preview
    STAGING_URL=$(vercel --name "$PROJECT_NAME" --env NEXT_PUBLIC_APP_ENV=staging 2>/dev/null | grep "https://")
    
    if [ -z "$STAGING_URL" ]; then
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Deployed to staging: $STAGING_URL${NC}"
    echo "$STAGING_URL" > .staging-url
}

# Function to run post-deployment health checks
health_check() {
    echo -e "${YELLOW}🏥 Running health checks...${NC}"
    
    if [ -f ".staging-url" ]; then
        STAGING_URL=$(cat .staging-url)
        echo -e "Checking: $STAGING_URL"
        
        # Wait a moment for deployment to be ready
        sleep 10
        
        # Check if the site responds
        if curl -f -s "$STAGING_URL" > /dev/null; then
            echo -e "${GREEN}✅ Site is responding${NC}"
        else
            echo -e "${RED}❌ Site not responding${NC}"
            exit 1
        fi
    fi
}

# Function to create deployment summary
create_summary() {
    echo -e "${BLUE}📊 Deployment Summary${NC}"
    echo "====================="
    
    if [ -f ".staging-url" ]; then
        STAGING_URL=$(cat .staging-url)
        echo -e "Staging URL: ${GREEN}$STAGING_URL${NC}"
    fi
    
    echo -e "Branch: ${GREEN}$STAGING_BRANCH${NC}"
    echo -e "Environment: ${GREEN}staging${NC}"
    echo -e "Gaming features: ${GREEN}enabled${NC}"
    echo -e "Deployment time: ${GREEN}$(date)${NC}"
    
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Test the staging environment thoroughly"
    echo "2. Verify all gaming features work correctly"
    echo "3. Test database migrations and data integrity"
    echo "4. Once validated, run: ./scripts/deploy-production.sh"
}

# Main deployment flow
main() {
    check_prerequisites
    run_tests
    deploy_to_staging
    health_check
    create_summary
    
    echo -e "${GREEN}🎉 Staging deployment completed successfully!${NC}"
}

# Error handler
error_handler() {
    echo -e "${RED}❌ Deployment failed. Check the logs above for details.${NC}"
    exit 1
}

# Set up error handling
trap error_handler ERR

# Run main deployment
main