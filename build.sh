#!/bin/bash

# Ensure we exit on any error
set -e

echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set environment variables for production
export NODE_ENV=production
export PORT=3000

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Start the server
echo "🌟 Starting server..."
node server.js