````instructions
# BaseSQL - Copilot Instructions

## Architecture Overview

This is an **ORM-agnostic** multi-database SQL query builder supporting both **Sequelize** and **Prisma**. It abstracts pagination, search, and filtering across MySQL, PostgreSQL, and MSSQL. The architecture uses the **Factory Pattern**, **Template Method Pattern**, and **Adapter Pattern** to handle database-specific SQL generation and ORM abstraction.

### Core Components

**Monorepo Structure:**
- **`@basesql/core`** - ORM-agnostic SQL generation, pagination, filtering logic
- **`@basesql/sequelize`** - Sequelize adapter implementing `IQueryExecutor`
- **`@basesql/prisma`** - Prisma adapter implementing `IQueryExecutor`

**Core Classes:**
- **`BaseSql`** extends `RawSQL` and `AbstractSql` - Main entry point, orchestrates query building
- **`AbstractSql`** - Template defining required methods (`primaryKeyField()`, `searchColumns()`, `orderBy()`, etc.)
- **`RawSQL`** - Base class requiring `rawSQL()` method implementation for custom queries
- **`IQueryExecutor`** - Interface for ORM-specific query execution
- **`TemplateEngine`** - Handles parameter style conversion (Handlebars-based)
- **Factory Classes** - Handle database-specific implementations via runtime switching

## Key Patterns

### 1. Adapter Pattern for ORM Abstraction
```typescript
// IQueryExecutor interface abstracts ORM-specific query execution
interface IQueryExecutor {
  query<T>(sql: string, params: Record<string, any>): Promise<T[]>;
  queryOne<T>(sql: string, params: Record<string, any>): Promise<T | null>;
  getDatabaseType(): DatabaseType;
}

// Sequelize adapter
const sequelizeExecutor = new SequelizeExecutor(sequelizeInstance);

// Prisma adapter  
const prismaExecutor = new PrismaExecutor(prismaClient, DatabaseType.POSTGRESQL);
```

### 2. Database-Specific Factory Pattern
```typescript
// Factories automatically resolve database-specific implementations
new PaginatorFactory(DatabaseType.MYSQL)  // → PaginatorMYSQL
new SearchColumnFactory(name, type, op, value, DatabaseType.POSTGRESQL)  // → SearchColumnResolverPOSTGRESQL
```

### 3. Template Method Implementation
```typescript
class MyQuery extends BaseSql {
  rawSQL() { return 'SELECT * FROM users'; }
  searchColumns() { 
    return { 
      name: { op: SearchOperator.i_cont, type: SearchColumnType.string } 
    }; 
  }
  primaryKeyField() { return ['id', 'tenant_id']; } // Supports composite keys
}
```

### 4. Static Call Pattern with Executor
```typescript
// New pattern - pass IQueryExecutor instead of ORM instance
const result = await MyQuery.call<UserType>(executor, {
  page: 1,
  perPage: 20,
  searchTerm: 'john',
  filter: { status: { value: 'active', op: SearchOperator.eq, type: SearchColumnType.string } }
});
// Returns: { meta: { page, perPage, totalRows, totalPages }, records: UserType[] }
```

### 5. Parameter Style Conversion (Handlebars-based)
```typescript
// TemplateEngine converts between parameter styles:
// - NAMED: :param (Sequelize)
// - POSITIONAL: $1, $2 (Prisma PostgreSQL)
// - QUESTION: ? (Prisma MySQL)
const { sql, params } = templateEngine.convertParameterStyle(
  'SELECT * FROM users WHERE id = :id',
  { id: 123 },
  ParameterStyle.POSITIONAL
);
// Result: 'SELECT * FROM users WHERE id = $1', [123]
```

## Database-Specific Behaviors

### Search Operations
- **MySQL**: Uses `UPPER()` for case-insensitive search
- **PostgreSQL**: Uses `ILIKE` for case-insensitive search  
- **MSSQL**: Uses `COLLATE Latin1_General_CI_AI` for case-insensitive search

### Pagination
- **MySQL/PostgreSQL**: `LIMIT x OFFSET y`
- **MSSQL**: `OFFSET x ROWS FETCH NEXT y ROWS ONLY`

## Search & Filter System

### SearchOperator Enum
Contains 26+ operators: `eq`, `not_eq`, `cont`, `i_cont`, `like`, `i_like`, `gt`, `gteq`, `lt`, `lteq`, `in`, `not_in`, `null`, `not_null`, `empty`, `not_empty`, `blank`, `present`, `start`, `end`, `true`, `false`, etc.

### Filter vs SearchColumns
- **`filter`**: Exact field matching with specific operators
- **`searchColumns`**: Global search term applied across multiple columns with OR logic

## Module Dependencies

Uses `@basesql/*` scoped imports in the monorepo structure:
- `@basesql/core` - Core types, factories, and SQL generation
- `@basesql/sequelize` - Sequelize executor adapter
- `@basesql/prisma` - Prisma executor adapter

**Within packages:**
- Core package is self-contained with no external dependencies (except Handlebars)
- Adapters depend on `@basesql/core` and their respective ORMs as peer dependencies

## Implementation Guidelines

1. **Always extend `BaseSql`** for new queries, never instantiate directly
2. **Implement all abstract methods** even if returning empty defaults
3. **Use factories for database switching** - never directly instantiate database-specific classes
4. **Primary keys can be composite** - return string arrays from `primaryKeyField()`
5. **SQL injection prevention** - All values are parameterized via template engine
6. **Query counting strategy** - Wraps main query in `SELECT COUNT(*) FROM (originalQuery) TABCOUNT`
7. **Parameter conversion** - TemplateEngine automatically converts `:param` to appropriate style for each ORM

## Error Handling Patterns

- Unsupported database types throw errors in factory constructors
- Invalid primary key filters validate field counts match composite key requirements
- NaN value handling in search column resolvers defaults to 0/0.0
- Missing `rawSQL()` implementation throws "Not Implemented" error