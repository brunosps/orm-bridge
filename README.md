# ORM Bridge

**ORM-agnostic SQL query builder** for Sequelize and Prisma with support for MySQL, PostgreSQL, and MSSQL.

---

## 🚀 Features

- 🎯 **ORM Agnostic**: Works with both Sequelize and Prisma
- 🗄️ **Multi-Database**: MySQL, PostgreSQL, MSSQL support
- 🔍 **Smart Search**: 26+ search operators with database-specific optimizations
- 📄 **Pagination**: Built-in pagination with metadata
- 🎨 **Template-Based**: Uses Handlebars for flexible SQL parameter handling
- 🏗️ **Type-Safe**: Full TypeScript support

## Packages

This is a monorepo containing:

- `@orm-bridge/core` - Core SQL generation logic (ORM-agnostic)
- `@orm-bridge/sequelize` - Sequelize adapter
- `@orm-bridge/prisma` - Prisma adapter

## Installation

### Development Setup (Monorepo)

```bash
# Clone or navigate to the repository
cd basesql-sequelize

# Install dependencies for all packages
npm install

# Build all packages
npm run build --workspaces
```

### Using in Your Projects

Once published to npm:

```bash
# For Sequelize users
npm install @orm-bridge/core @orm-bridge/sequelize

# For Prisma users
npm install @orm-bridge/core @orm-bridge/prisma
```

### Local Development (Linking Packages)

If you want to test locally before publishing:

```bash
# In the basesql-sequelize directory
cd packages/core
npm link

cd ../sequelize
npm link @orm-bridge/core
npm link

cd ../prisma
npm link @orm-bridge/core
npm link

# In your project directory
npm link @orm-bridge/core @orm-bridge/sequelize
# or
npm link @orm-bridge/core @orm-bridge/prisma
```

## Quick Start

### With Sequelize

```typescript
import { BaseSql } from '@orm-bridge/core';
import { SequelizeExecutor } from '@orm-bridge/sequelize';
import { SearchOperator, SearchColumnType } from '@orm-bridge/core';

class UserQuery extends BaseSql {
  rawSQL() {
    return 'SELECT * FROM users';
  }
  
  searchColumns() {
    return {
      name: { op: SearchOperator.i_cont, type: SearchColumnType.string },
      email: { op: SearchOperator.i_cont, type: SearchColumnType.string }
    };
  }
}

const executor = new SequelizeExecutor(sequelizeInstance);
const result = await UserQuery.call(executor, {
  page: 1,
  perPage: 20,
  searchTerm: 'john'
});
```

### With Prisma

```typescript
import { BaseSql } from '@orm-bridge/core';
import { PrismaExecutor } from '@orm-bridge/prisma';
import { SearchOperator, SearchColumnType } from '@orm-bridge/core';

class UserQuery extends BaseSql {
  rawSQL() {
    return 'SELECT * FROM users';
  }
  
  searchColumns() {
    return {
      name: { op: SearchOperator.i_cont, type: SearchColumnType.string }
    };
  }
}

const executor = new PrismaExecutor(prisma);
const result = await UserQuery.call(executor, {
  page: 1,
  perPage: 20,
  searchTerm: 'john'
});
```

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test
```

## License

MIT
