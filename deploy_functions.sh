#!/bin/bash

# Deploy Edge Functions to Supabase
# Run this script to deploy all functions

echo "🚀 Deploying WineSnap Edge Functions to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Login to Supabase (if not already logged in)
echo "🔐 Logging in to Supabase..."
supabase login

# Link to your project
echo "🔗 Linking to project lcxreetjkonkgwerqjqk..."
supabase link --project-ref lcxreetjkonkgwerqjqk

# Deploy voice processing function
echo "📤 Deploying voice-process function..."
supabase functions deploy voice-process --no-verify-jwt

# Deploy wines API function
echo "📤 Deploying wines-api function..."
supabase functions deploy wines-api --no-verify-jwt

echo "✅ All functions deployed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Set OPENAI_API_KEY in Supabase Edge Functions settings"
echo "2. Update Vercel environment variables"
echo "3. Test the integration"