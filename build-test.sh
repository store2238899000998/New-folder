#!/bin/bash

# Build test script for Investment Telegram Bot
echo "🚀 Testing Investment Telegram Bot Build..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ dist folder not found after build"
    exit 1
fi

echo "✅ dist folder created"

# Test Docker build (optional)
if command -v docker &> /dev/null; then
    echo "🐳 Testing Docker build..."
    docker build -t investment-bot-test .
    
    if [ $? -eq 0 ]; then
        echo "✅ Docker build successful"
        echo "🧹 Cleaning up test image..."
        docker rmi investment-bot-test
    else
        echo "❌ Docker build failed"
        exit 1
    fi
else
    echo "⚠️  Docker not found, skipping Docker build test"
fi

echo "🎉 All tests passed! The Investment Telegram Bot is ready for deployment."
