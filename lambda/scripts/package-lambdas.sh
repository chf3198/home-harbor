#!/bin/bash

# Package Lambda functions for deployment
# This script compiles TypeScript and creates deployment ZIP files

set -e

echo "=== Packaging Lambda Functions ==="

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo "Error: TypeScript compiler not found"
    echo "Run: npm install"
    exit 1
fi

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/
rm -rf packages/

# Create directories
mkdir -p dist/
mkdir -p packages/

# Compile TypeScript
echo "Compiling TypeScript..."
tsc

# Install production dependencies
echo "Installing production dependencies..."
npm ci --production --prefix /tmp/lambda-deps
rm -rf /tmp/lambda-deps/node_modules/aws-sdk # AWS SDK is included in Lambda runtime

# Function to package a Lambda function
package_function() {
    local func_name=$1
    local entry_file=$2
    
    echo "Packaging $func_name..."
    
    # Create temporary directory
    local temp_dir="/tmp/lambda-package-${func_name}"
    rm -rf "$temp_dir"
    mkdir -p "$temp_dir"
    
    # Copy compiled JavaScript
    cp "dist/${entry_file}.js" "$temp_dir/index.js"
    cp "dist/${entry_file}.js.map" "$temp_dir/index.js.map" 2>/dev/null || true
    
    # Copy node_modules
    if [ -d "/tmp/lambda-deps/node_modules" ]; then
        cp -r /tmp/lambda-deps/node_modules "$temp_dir/"
    fi
    
    # Create ZIP
    cd "$temp_dir"
    zip -r -q "${func_name}.zip" .
    cd -
    
    # Move ZIP to packages directory
    mv "$temp_dir/${func_name}.zip" "packages/${func_name}.zip"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    echo "✓ Packaged $func_name ($(du -h packages/${func_name}.zip | cut -f1))"
}

# Package each Lambda function
package_function "redfin-ingestion" "redfin-ingestion"
package_function "ct-socrata-etl" "ct-socrata-etl"
package_function "street-view-fetch" "street-view-fetch"
package_function "ai-vision-analysis" "ai-vision-analysis"
package_function "ai-description-generator" "ai-description-generator"

echo ""
echo "=== Packaging Complete ==="
echo "Packages created in ./packages/"
ls -lh packages/*.zip

echo ""
echo "Ready for deployment!"
