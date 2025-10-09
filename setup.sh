#!/bin/bash

# Setup script for BaseSQL monorepo

echo "🚀 Setting up BaseSQL monorepo..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo ""
echo "📦 Installing dependencies for all packages..."
npm install

echo ""
echo "🔨 Building all packages..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Package structure:"
echo "  - @basesql/core       → packages/core/dist"
echo "  - @basesql/sequelize  → packages/sequelize/dist"
echo "  - @basesql/prisma     → packages/prisma/dist"
echo ""
echo "🎯 Next steps:"
echo "  1. To use with Sequelize: npm link @basesql/core @basesql/sequelize"
echo "  2. To use with Prisma:    npm link @basesql/core @basesql/prisma"
echo "  3. See EXAMPLES.md for usage examples"
echo "  4. See MIGRATION.md for migration guide"
echo ""
