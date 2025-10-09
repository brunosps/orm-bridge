# Development Guide

## Project Structure

```
basesql-sequelize/
├── packages/
│   ├── core/               # @basesql/core
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── base-sql.ts
│   │   │   ├── template-engine.ts
│   │   │   ├── paginator-factory.ts
│   │   │   ├── search-column-factory.ts
│   │   │   ├── paginator/
│   │   │   └── search-column/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── sequelize/          # @basesql/sequelize
│   │   ├── src/
│   │   │   ├── sequelize-executor.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── prisma/             # @basesql/prisma
│       ├── src/
│       │   ├── prisma-executor.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .github/
│   └── copilot-instructions.md
├── package.json            # Root package (monorepo)
├── tsconfig.json           # Root TypeScript config
├── README.md
├── MIGRATION.md
├── EXAMPLES.md
└── setup.sh
```

## Initial Setup

### 1. Quick Setup

```bash
# Run the setup script
./setup.sh
```

This will:
- Install all dependencies
- Build all packages
- Display next steps

### 2. Manual Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build
```

## Development Workflow

### Building Packages

```bash
# Build all packages
npm run build

# Build specific package
npm run build:core
npm run build:sequelize
npm run build:prisma

# Clean build artifacts
npm run clean:dist

# Clean everything (including node_modules)
npm run clean
```

### Testing Locally

#### Option 1: Using npm link

```bash
# In basesql-sequelize directory
cd packages/core
npm link

cd ../sequelize
npm link @basesql/core
npm link

# In your test project
npm link @basesql/core @basesql/sequelize
```

#### Option 2: Using npm workspaces (recommended)

Create a test project inside the monorepo:

```bash
mkdir -p test/sequelize-test
cd test/sequelize-test
npm init -y
```

Then in your test package.json:
```json
{
  "dependencies": {
    "@basesql/core": "file:../../packages/core",
    "@basesql/sequelize": "file:../../packages/sequelize"
  }
}
```

### Making Changes

1. **Edit code** in `packages/*/src/`
2. **Rebuild** the affected package:
   ```bash
   npm run build:core
   # or
   npm run build:sequelize
   # or
   npm run build:prisma
   ```
3. **Test** in your project

### Watch Mode (for development)

Add to individual package.json:
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "build:watch": "tsc -p tsconfig.json --watch"
  }
}
```

Then run:
```bash
cd packages/core
npm run build:watch
```

## Package Dependencies

### @basesql/core
- **Dependencies**: `handlebars`
- **DevDependencies**: `typescript`, `@types/node`, `@types/handlebars`
- **Peer Dependencies**: None

### @basesql/sequelize
- **Dependencies**: `@basesql/core`
- **Peer Dependencies**: `sequelize@^6.0.0`
- **DevDependencies**: `typescript`, `@types/node`, `sequelize`

### @basesql/prisma
- **Dependencies**: `@basesql/core`
- **Peer Dependencies**: `@prisma/client@^5.0.0`
- **DevDependencies**: `typescript`, `@types/node`, `@prisma/client`

## TypeScript Configuration

The project uses TypeScript project references:

- **Root `tsconfig.json`**: Base configuration
- **Package `tsconfig.json`**: Extends root, adds package-specific settings
- **Build order**: Core → Sequelize/Prisma (automatically handled)

## Common Issues

### Issue: Cannot find module '@basesql/core'

**Solution**: Build the core package first
```bash
npm run build:core
```

### Issue: Types not found

**Solution**: Rebuild with declarations
```bash
npm run clean:dist
npm run build
```

### Issue: Changes not reflected

**Solution**: 
1. Rebuild the changed package
2. If using npm link, re-link:
   ```bash
   npm unlink @basesql/core
   cd packages/core
   npm link
   cd your-project
   npm link @basesql/core
   ```

## Publishing to npm

### Prerequisites

1. Create accounts on npmjs.com
2. Login: `npm login`
3. Verify access: `npm whoami`

### Publishing Process

```bash
# 1. Build all packages
npm run build

# 2. Test locally first!

# 3. Update versions (in each package.json)
# packages/core/package.json
# packages/sequelize/package.json
# packages/prisma/package.json

# 4. Publish core first
cd packages/core
npm publish --access public

# 5. Publish adapters
cd ../sequelize
npm publish --access public

cd ../prisma
npm publish --access public
```

### Automated Publishing (Optional)

Create a publish script:
```bash
#!/bin/bash
npm run build
cd packages/core && npm publish --access public
cd ../sequelize && npm publish --access public
cd ../prisma && npm publish --access public
```

## Git Workflow

### Commit Messages

Follow Conventional Commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

### Example Workflow

```bash
# 1. Make changes
git add .

# 2. Commit
git commit -m "feat(core): add support for BETWEEN operator"

# 3. Push
git push origin main
```

## Adding New Features

### Adding a New Search Operator

1. Add to `SearchOperator` enum in `packages/core/src/types.ts`
2. Implement methods in all search-column resolvers:
   - `search-column-resolver-MYSQL.ts`
   - `search-column-resolver-POSTGRESQL.ts`
   - `search-column-resolver-MSSQL.ts`
3. Add tests (if implemented)
4. Update documentation

### Adding a New Database

1. Create new paginator: `packages/core/src/paginator/paginator-NEWDB.ts`
2. Create new resolver: `packages/core/src/search-column/search-column-resolver-NEWDB.ts`
3. Update factories to include new database
4. Update `DatabaseType` enum
5. Test thoroughly

### Adding a New ORM Adapter

1. Create new package: `packages/neworm/`
2. Implement `IQueryExecutor` interface
3. Handle parameter conversion via `TemplateEngine`
4. Add to workspace in root `package.json`
5. Create documentation

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Sequelize Documentation](https://sequelize.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Handlebars Documentation](https://handlebarsjs.com/)

## Support

For questions or issues:
1. Check existing documentation (README.md, MIGRATION.md, EXAMPLES.md)
2. Review Copilot Instructions (.github/copilot-instructions.md)
3. Check git history for implementation patterns
