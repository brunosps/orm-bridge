# BaseSQL Sequelize - Copilot Instructions

## Architecture Overview

This is a multi-database SQL query builder for Sequelize that abstracts pagination, search, and filtering across MySQL, PostgreSQL, and MSSQL. The architecture uses the **Factory Pattern** and **Template Method Pattern** to handle database-specific SQL generation.

### Core Components

- **`BaseSql`** extends `RawSQL` and `AbstractSql` - Main entry point that orchestrates query building
- **`AbstractSql`** - Template defining required methods (`primaryKeyField()`, `searchColumns()`, `orderBy()`, etc.)
- **`RawSQL`** - Base class requiring `rawSQL()` method implementation for custom queries
- **Factory Classes** - Handle database-specific implementations via runtime switching

## Key Patterns

### 1. Database-Specific Factory Pattern
```typescript
// Factories automatically resolve database-specific implementations
new PaginatorFactory(DatabaseType.MYSQL)  // → PaginatorMYSQL
new SearchColumnFactory(name, type, op, value, DatabaseType.POSTGRESQL)  // → SearchColumnResolverPOSTGRESQL
```

### 2. Template Method Implementation
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

### 3. Static Call Pattern
```typescript
// Primary usage pattern - returns paginated results with metadata
const result = await MyQuery.call<UserType>(sequelizeInstance, {
  page: 1,
  perPage: 20,
  searchTerm: 'john',
  filter: { status: { value: 'active', op: SearchOperator.eq, type: SearchColumnType.string } }
});
// Returns: { meta: { page, perPage, totalRows, totalPages }, records: UserType[] }
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

Uses `@core` aliased imports - this is part of a larger monorepo structure:
- `@core/base/types` for `ListOfRecords`
- `@core/sql/types` for internal types

## Implementation Guidelines

1. **Always extend `BaseSql`** for new queries, never instantiate directly
2. **Implement all abstract methods** even if returning empty defaults
3. **Use factories for database switching** - never directly instantiate database-specific classes
4. **Primary keys can be composite** - return string arrays from `primaryKeyField()`
5. **SQL injection prevention** - All values are parameterized via Sequelize replacements
6. **Query counting strategy** - Wraps main query in `SELECT COUNT(*) FROM (originalQuery) TABCOUNT`

## Error Handling Patterns

- Unsupported database types throw errors in factory constructors
- Invalid primary key filters validate field counts match composite key requirements
- NaN value handling in search column resolvers defaults to 0/0.0
- Missing `rawSQL()` implementation throws "Not Implemented" error