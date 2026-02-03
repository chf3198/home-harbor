#!/bin/bash
# Setup script for git hooks
# Run this once after cloning the repository

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HOOKS_DIR="$SCRIPT_DIR/.git/hooks"

echo "📦 Setting up git hooks..."

# Make pre-commit hook executable
if [ -f "$HOOKS_DIR/pre-commit" ]; then
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "✅ Pre-commit hook installed"
else
    echo "⚠️  Pre-commit hook not found"
fi

echo "✅ Git hooks setup complete!"
