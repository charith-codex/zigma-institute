#!/bin/bash

# Exam Migration Setup Script
# This script sets up the database and Prisma client for the exam time limit and instructions feature

set -e  # Exit on any error

echo "🚀 Setting up Exam Time Limit & Instructions Migration..."
echo ""

echo "Step 1/5: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

echo "Step 2/5: Applying database migration..."
npx prisma migrate deploy
echo "✅ Migration applied"
echo ""

echo "Step 3/5: Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

echo "Step 4/5: Verifying migration status..."
npx prisma migrate status
echo ""

echo "Step 5/5: Setup complete!"
echo ""
echo "✨ You can now start your development server:"
echo "   npm run dev"
echo ""
echo "📚 See MIGRATION_GUIDE.md for troubleshooting."
