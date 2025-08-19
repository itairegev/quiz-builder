#!/bin/bash

# Shopify Quiz Builder Development Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Shopify Quiz Builder development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm run install:workspaces

# Start Docker services
echo "🐳 Starting Docker services..."
npm run docker:up

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

# Seed database with sample data
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Copy env.example to .env and configure your environment variables"
echo "2. Set up your Shopify Partner account and app credentials"
echo "3. Run 'npm run dev' to start all development servers"
echo ""
echo "📱 Services running on:"
echo "   - Admin Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:4000"
echo "   - Storefront Component: http://localhost:5000"
echo "   - Database Admin: http://localhost:8080"
echo ""
echo "🔧 Useful commands:"
echo "   - npm run dev          - Start all development servers"
echo "   - npm run docker:logs  - View Docker logs"
echo "   - npm run docker:down  - Stop Docker services"
echo "   - npm run clean        - Clean up everything"
