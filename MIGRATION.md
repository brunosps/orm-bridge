# Migration Guide: Sequelize-only to ORM-Agnostic

## Overview

BaseSQL was refactored from a Sequelize-only implementation to an ORM-agnostic architecture supporting both Sequelize and Prisma.

## Breaking Changes

### API Change

**Before (v0.x - Sequelize-only):**
```typescript
import { BaseSql } from './base-sql';
import { Sequelize } from 'sequelize';

const result = await MyQuery.call<UserType>(sequelizeInstance, {
  page: 1,
  perPage: 20
});
```

**After (v1.x - ORM-agnostic):**
```typescript
import { BaseSql } from '@basesql/core';
import { SequelizeExecutor } from '@basesql/sequelize';
import { Sequelize } from 'sequelize';

const executor = new SequelizeExecutor(sequelizeInstance);
const result = await MyQuery.call<UserType>(executor, {
  page: 1,
  perPage: 20
});
```

## Package Structure

The codebase is now organized as a monorepo:

```
packages/
├── core/          # @basesql/core - ORM-agnostic logic
├── sequelize/     # @basesql/sequelize - Sequelize adapter
└── prisma/        # @basesql/prisma - Prisma adapter
```

## Migration Steps

### 1. Install New Packages

**For Sequelize users:**
```bash
npm install @basesql/core @basesql/sequelize
# or
yarn add @basesql/core @basesql/sequelize
```

**For Prisma users:**
```bash
npm install @basesql/core @basesql/prisma
# or
yarn add @basesql/core @basesql/prisma
```

### 2. Update Imports

**Before:**
```typescript
import { BaseSql, SearchOperator, SearchColumnType } from './base-sql';
```

**After:**
```typescript
import { BaseSql, SearchOperator, SearchColumnType } from '@basesql/core';
import { SequelizeExecutor } from '@basesql/sequelize';
// or
import { PrismaExecutor } from '@basesql/prisma';
```

### 3. Create Executor Instance

**Sequelize:**
```typescript
import { SequelizeExecutor } from '@basesql/sequelize';
import { sequelize } from './database'; // your Sequelize instance

const executor = new SequelizeExecutor(sequelize);
```

**Prisma:**
```typescript
import { PrismaExecutor } from '@basesql/prisma';
import { DatabaseType } from '@basesql/core';
import { prisma } from './database'; // your Prisma client

const executor = new PrismaExecutor(prisma, DatabaseType.POSTGRESQL);
```

### 4. Update Query Calls

**Before:**
```typescript
const result = await UserQuery.call(sequelizeInstance, params);
```

**After:**
```typescript
const result = await UserQuery.call(executor, params);
```

## New Features

### 1. Prisma Support

You can now use the same query classes with Prisma:

```typescript
import { BaseSql, DatabaseType } from '@basesql/core';
import { PrismaExecutor } from '@basesql/prisma';

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

const executor = new PrismaExecutor(prisma, DatabaseType.POSTGRESQL);
const result = await UserQuery.call(executor, { searchTerm: 'john' });
```

### 2. Template Engine with Parameter Conversion

The new TemplateEngine automatically converts between parameter styles:

- **Sequelize**: `:param` (NAMED)
- **Prisma PostgreSQL**: `$1, $2` (POSITIONAL)
- **Prisma MySQL**: `?` (QUESTION)

No code changes needed - it's automatic!

### 3. Auto Database Type Detection

**Sequelize:**
```typescript
// Automatically detects MySQL, PostgreSQL, or MSSQL from Sequelize dialect
const executor = new SequelizeExecutor(sequelize);
```

**Prisma:**
```typescript
// Must specify database type (Prisma doesn't expose this easily)
const executor = new PrismaExecutor(prisma, DatabaseType.POSTGRESQL);
```

## Complete Example

### Sequelize Example

```typescript
import { BaseSql, SearchOperator, SearchColumnType } from '@basesql/core';
import { SequelizeExecutor } from '@basesql/sequelize';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgres://localhost/mydb');

class UserListQuery extends BaseSql {
  rawSQL() {
    return 'SELECT id, name, email, created_at FROM users';
  }
  
  searchColumns() {
    return {
      name: { op: SearchOperator.i_cont, type: SearchColumnType.string },
      email: { op: SearchOperator.i_cont, type: SearchColumnType.string }
    };
  }
  
  orderBy() {
    return { created_at: OrderByPropsEnum.desc };
  }
  
  perPage() {
    return 25;
  }
}

const executor = new SequelizeExecutor(sequelize);

const result = await UserListQuery.call<User>(executor, {
  page: 1,
  perPage: 20,
  searchTerm: 'john',
  filter: {
    status: { 
      value: 'active', 
      op: SearchOperator.eq, 
      type: SearchColumnType.string 
    }
  }
});

console.log(result.meta); // { page: 1, perPage: 20, totalPages: 5, totalRows: 100 }
console.log(result.records); // User[]
```

### Prisma Example

```typescript
import { BaseSql, SearchOperator, SearchColumnType, DatabaseType } from '@basesql/core';
import { PrismaExecutor } from '@basesql/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class UserListQuery extends BaseSql {
  rawSQL() {
    return 'SELECT id, name, email, created_at FROM users';
  }
  
  searchColumns() {
    return {
      name: { op: SearchOperator.i_cont, type: SearchColumnType.string },
      email: { op: SearchOperator.i_cont, type: SearchColumnType.string }
    };
  }
  
  orderBy() {
    return { created_at: OrderByPropsEnum.desc };
  }
}

const executor = new PrismaExecutor(prisma, DatabaseType.POSTGRESQL);

const result = await UserListQuery.call<User>(executor, {
  page: 1,
  searchTerm: 'john'
});

console.log(result.meta);
console.log(result.records);
```

## Troubleshooting

### TypeScript Errors

If you see module not found errors:

```bash
# Make sure all dependencies are installed
npm install

# For development, link local packages
npm install --workspaces
```

### Parameter Style Issues

The TemplateEngine automatically handles parameter conversion. If you see parameter-related errors:

1. Check that your SQL uses `:paramName` format (named parameters)
2. The conversion to `$1` or `?` happens automatically based on the ORM

### Database Type Detection

**Sequelize:** Auto-detected from dialect  
**Prisma:** Must be specified in constructor

```typescript
// Prisma requires explicit database type
const executor = new PrismaExecutor(prisma, DatabaseType.POSTGRESQL);
```

## Support

For issues or questions:
- Check the updated Copilot Instructions: `.github/copilot-instructions.md`
- Review the README.md for usage examples
- Check the source code in `packages/*/src/`
