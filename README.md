# BaseSQL

Multi-database SQL query builder abstraction supporting Sequelize and Prisma. Provides pagination, search, and filtering capabilities across MySQL, PostgreSQL, and MSSQL.

## Features

- 🎯 **ORM Agnostic**: Works with both Sequelize and Prisma
- 🗄️ **Multi-Database**: MySQL, PostgreSQL, MSSQL support
- 🔍 **Smart Search**: 26+ search operators with database-specific optimizations
- 📄 **Pagination**: Built-in pagination with metadata
- 🎨 **Template-Based**: Uses Handlebars for flexible SQL parameter handling
- 🏗️ **Type-Safe**: Full TypeScript support

## Packages

This is a monorepo containing:

- `@basesql/core` - Core SQL generation logic (ORM-agnostic)
- `@basesql/sequelize` - Sequelize adapter
- `@basesql/prisma` - Prisma adapter

## Installation

```bash
# For Sequelize users
npm install @basesql/core @basesql/sequelize

# For Prisma users
npm install @basesql/core @basesql/prisma
```

## Quick Start

### With Sequelize

```typescript
import { BaseSql } from '@basesql/core';
import { SequelizeExecutor } from '@basesql/sequelize';
import { SearchOperator, SearchColumnType } from '@basesql/core';

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
import { BaseSql } from '@basesql/core';
import { PrismaExecutor } from '@basesql/prisma';
import { SearchOperator, SearchColumnType } from '@basesql/core';

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
