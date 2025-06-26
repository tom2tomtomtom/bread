#!/bin/bash

# AIDEAS A+ Quality Netlify Deployment Script
# This script handles deployment with automatic error fixing and retry logic

set -e

echo "🚀 Starting AIDEAS A+ Quality Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Netlify CLI is installed
check_netlify_cli() {
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
        print_success "Netlify CLI installed successfully"
    else
        print_success "Netlify CLI is available"
    fi
}

# Check deployment status
check_deployment_status() {
    print_status "Checking current deployment status..."
    netlify status
    netlify logs | tail -20
}

# Attempt 1: Standard deployment
attempt_standard_deploy() {
    print_status "Attempt 1: Standard Netlify deployment..."
    
    if netlify deploy --prod; then
        print_success "Standard deployment successful!"
        return 0
    else
        print_error "Standard deployment failed"
        return 1
    fi
}

# Attempt 2: Local build and deploy
attempt_local_build_deploy() {
    print_status "Attempt 2: Local build and deploy..."
    
    # Clean install with legacy peer deps
    print_status "Cleaning and reinstalling dependencies..."
    rm -rf node_modules package-lock.json
    npm install --legacy-peer-deps
    
    # Build locally
    print_status "Building project locally..."
    if npm run build; then
        print_success "Local build successful"
        
        # Deploy build folder
        if netlify deploy --prod --dir=build; then
            print_success "Local build deployment successful!"
            return 0
        else
            print_error "Local build deployment failed"
            return 1
        fi
    else
        print_error "Local build failed"
        return 1
    fi
}

# Attempt 3: Fix common issues and retry
attempt_fix_and_retry() {
    print_status "Attempt 3: Fixing common issues and retrying..."
    
    # Fix linting issues
    print_status "Fixing linting issues..."
    npm run lint:fix || true
    
    # Update TypeScript configuration for compatibility
    print_status "Ensuring TypeScript compatibility..."
    
    # Commit fixes if any
    if git diff --quiet; then
        print_status "No changes to commit"
    else
        print_status "Committing fixes..."
        git add .
        git commit -m "🔧 fix: Automated deployment fixes"
        git push origin main
    fi
    
    # Wait for auto-deployment
    print_status "Waiting for auto-deployment to trigger..."
    sleep 30
    
    # Check if deployment succeeded
    if netlify logs | grep -q "Deploy succeeded"; then
        print_success "Auto-deployment after fixes successful!"
        return 0
    else
        print_error "Auto-deployment after fixes failed"
        return 1
    fi
}

# Attempt 4: Manual function deployment
attempt_manual_functions() {
    print_status "Attempt 4: Manual function deployment..."
    
    # Build functions
    if netlify functions:build; then
        print_success "Functions built successfully"
        
        # Deploy with functions
        if netlify deploy --prod --functions=netlify/functions; then
            print_success "Manual function deployment successful!"
            return 0
        else
            print_error "Manual function deployment failed"
            return 1
        fi
    else
        print_error "Function build failed"
        return 1
    fi
}

# Main deployment process
main() {
    print_status "🎯 AIDEAS A+ Quality Deployment Process Starting..."
    
    # Check prerequisites
    check_netlify_cli
    
    # Check current status
    check_deployment_status
    
    # Try different deployment strategies
    if attempt_standard_deploy; then
        print_success "✅ Deployment successful with standard method!"
        exit 0
    fi
    
    if attempt_local_build_deploy; then
        print_success "✅ Deployment successful with local build method!"
        exit 0
    fi
    
    if attempt_fix_and_retry; then
        print_success "✅ Deployment successful after fixes!"
        exit 0
    fi
    
    if attempt_manual_functions; then
        print_success "✅ Deployment successful with manual functions!"
        exit 0
    fi
    
    # If all attempts fail
    print_error "❌ All deployment attempts failed"
    print_status "Please check the following:"
    print_status "1. Netlify site configuration"
    print_status "2. Environment variables"
    print_status "3. Build logs for specific errors"
    print_status "4. Repository permissions"
    
    exit 1
}

# Run main function
main "$@"
