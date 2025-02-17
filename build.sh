#!/bin/bash
set -e

# Ensure the script fails on any error
set -o pipefail

echo "Installing dependencies..."
npm install

echo "Cleaning dist directory..."
rm -rf dist

echo "Generating Prisma client..."
npx prisma generate

echo "Compiling TypeScript..."
npx tsc

echo "Build completed!"
