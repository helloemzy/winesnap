#!/bin/bash

# WineSnap Environment Setup Script
# This script helps set up different environments for development, staging, and production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}⚙️  WineSnap Environment Setup${NC}"
echo "=============================="

# Function to create environment file
create_env_file() {
    local env_type=$1
    local env_file=".env.${env_type}"
    
    echo -e "${YELLOW}📄 Creating ${env_file}...${NC}"
    
    cat > "$env_file" << EOF
# WineSnap ${env_type^} Environment Configuration
# Generated on $(date)

# Application Environment
NEXT_PUBLIC_APP_ENV=${env_type}
NEXT_PUBLIC_VERCEL_URL=$([ "$env_type" = "development" ] && echo "localhost:3000" || echo "your-${env_type}-domain.vercel.app")

# Supabase Configuration
$([ "$env_type" = "staging" ] && echo "NEXT_PUBLIC_STAGING_SUPABASE_URL=your_staging_supabase_url" || echo "NEXT_PUBLIC_SUPABASE_URL=your_${env_type}_supabase_url")
$([ "$env_type" = "staging" ] && echo "NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY=your_staging_supabase_anon_key" || echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_${env_type}_supabase_anon_key")
$([ "$env_type" = "staging" ] && echo "STAGING_SUPABASE_SERVICE_ROLE_KEY=your_staging_supabase_service_role_key" || echo "SUPABASE_SERVICE_ROLE_KEY=your_${env_type}_supabase_service_role_key")

# Database Configuration
NEXT_PUBLIC_DATABASE_SCHEMA=$([ "$env_type" = "development" ] && echo "public" || echo "${env_type}")

# Feature Flags
NEXT_PUBLIC_ENABLE_GAMING_FEATURES=$([ "$env_type" = "production" ] && echo "true" || echo "true")
NEXT_PUBLIC_ENABLE_PET_SYSTEM=$([ "$env_type" = "production" ] && echo "true" || echo "true")
NEXT_PUBLIC_ENABLE_VIRAL_FEATURES=$([ "$env_type" = "production" ] && echo "true" || echo "true")
NEXT_PUBLIC_ENABLE_OFFLINE_SYNC=true

# Voice Processing Configuration
NEXT_PUBLIC_MAX_RECORDING_DURATION=30000
NEXT_PUBLIC_VOICE_PROCESSING_ENABLED=true
OPENAI_API_KEY=your_openai_api_key

# Storage Configuration
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=winesnap-media

# Analytics and Monitoring
NEXT_PUBLIC_ENABLE_ANALYTICS=$([ "$env_type" = "production" ] && echo "true" || echo "false")
NEXT_PUBLIC_SENTRY_DSN=$([ "$env_type" = "production" ] && echo "your_sentry_dsn" || echo "")

# API Configuration
NEXT_PUBLIC_API_BASE_URL=
WHISPER_API_ENDPOINT=

# Image Processing
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EOF

    echo -e "${GREEN}✅ Created ${env_file}${NC}"
}

# Function to setup development environment
setup_development() {
    echo -e "${YELLOW}🛠️  Setting up development environment...${NC}"
    
    create_env_file "development"
    
    # Create local environment file
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}📄 Creating .env.local for development...${NC}"
        cp .env.development .env.local
        echo -e "${GREEN}✅ Created .env.local from development template${NC}"
        echo -e "${YELLOW}⚠️  Please update .env.local with your actual values${NC}"
    fi
}

# Function to setup staging environment
setup_staging() {
    echo -e "${YELLOW}🧪 Setting up staging environment...${NC}"
    
    create_env_file "staging"
    
    echo -e "${BLUE}Staging environment features:${NC}"
    echo "- Separate Supabase project/database"
    echo "- Gaming features enabled"
    echo "- Test data and configurations"
    echo "- Analytics disabled"
    echo "- Debug logging enabled"
}

# Function to setup production environment
setup_production() {
    echo -e "${YELLOW}🚀 Setting up production environment...${NC}"
    
    create_env_file "production"
    
    echo -e "${BLUE}Production environment features:${NC}"
    echo "- Production Supabase project"
    echo "- All gaming features enabled"
    echo "- Analytics enabled"
    echo "- Performance optimizations"
    echo "- Error monitoring enabled"
}

# Function to validate environment
validate_environment() {
    local env_file=$1
    
    echo -e "${YELLOW}🔍 Validating ${env_file}...${NC}"
    
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}❌ ${env_file} not found${NC}"
        return 1
    fi
    
    # Check for required variables
    local required_vars=(
        "NEXT_PUBLIC_APP_ENV"
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep -q "^${var}=your_" "$env_file"; then
            echo -e "${YELLOW}⚠️  ${var} needs to be configured in ${env_file}${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ Environment validation completed${NC}"
}

# Function to switch environments
switch_environment() {
    local target_env=$1
    local env_file=".env.${target_env}"
    
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}❌ ${env_file} not found. Run setup for ${target_env} first.${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🔄 Switching to ${target_env} environment...${NC}"
    
    # Backup current .env.local
    if [ -f ".env.local" ]; then
        cp .env.local ".env.local.backup"
        echo -e "${BLUE}📦 Backed up current .env.local${NC}"
    fi
    
    # Copy target environment to .env.local
    cp "$env_file" .env.local
    echo -e "${GREEN}✅ Switched to ${target_env} environment${NC}"
    
    # Show current configuration
    echo -e "${BLUE}Current configuration:${NC}"
    grep "^NEXT_PUBLIC_APP_ENV=" .env.local || echo "APP_ENV not set"
    grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | head -1 || echo "Supabase URL not set"
}

# Function to show help
show_help() {
    echo -e "${BLUE}WineSnap Environment Setup Help${NC}"
    echo "==============================="
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  setup-dev       Setup development environment"
    echo "  setup-staging   Setup staging environment"
    echo "  setup-prod      Setup production environment"
    echo "  switch <env>    Switch to environment (dev/staging/prod)"
    echo "  validate <env>  Validate environment configuration"
    echo "  help           Show this help message"
    echo
    echo "Examples:"
    echo "  $0 setup-dev"
    echo "  $0 switch staging"
    echo "  $0 validate production"
}

# Main script logic
case "${1:-}" in
    "setup-dev")
        setup_development
        ;;
    "setup-staging")
        setup_staging
        ;;
    "setup-prod")
        setup_production
        ;;
    "switch")
        if [ -z "${2:-}" ]; then
            echo -e "${RED}❌ Please specify environment: dev, staging, or prod${NC}"
            exit 1
        fi
        case "$2" in
            "dev"|"development")
                switch_environment "development"
                ;;
            "staging")
                switch_environment "staging"
                ;;
            "prod"|"production")
                switch_environment "production"
                ;;
            *)
                echo -e "${RED}❌ Invalid environment: $2${NC}"
                echo -e "Valid options: dev, staging, prod"
                exit 1
                ;;
        esac
        ;;
    "validate")
        if [ -z "${2:-}" ]; then
            echo -e "${RED}❌ Please specify environment file${NC}"
            exit 1
        fi
        validate_environment ".env.$2"
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac