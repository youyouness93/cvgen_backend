#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Clean up
echo "Cleaning dist directory..."
rm -rf dist
mkdir -p dist

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Compile TypeScript
echo "Compiling TypeScript..."
npx tsc --project tsconfig.json

# Verify build
echo "Verifying build..."
if [ ! -f "dist/index.js" ]; then
    echo "Error: dist/index.js not found after build!"
    exit 1
fi

echo "Build completed successfully!"
