# Usage Examples

## Basic Query

### Sequelize

```typescript
import { BaseSql, SearchOperator, SearchColumnType, OrderByPropsEnum } from '@basesql/core';
import { SequelizeExecutor } from '@basesql/sequelize';

class UserQuery extends BaseSql {
  rawSQL() {
    return `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.created_at
      FROM users u
    `;
  }
  
  searchColumns() {
    return {
      'u.name': { op: SearchOperator.i_cont, type: SearchColumnType.string },
      'u.email': { op: SearchOperator.i_cont, type: SearchColumnType.string }
    };
  }
  
  orderBy() {
    return {
      'u.created_at': OrderByPropsEnum.desc
    };
  }
}

// Usage
const executor = new SequelizeExecutor(sequelize);
const result = await UserQuery.call(executor, {
  page: 1,
  perPage: 20,
  searchTerm: 'john'
});
```

### Prisma

```typescript
import { BaseSql, SearchOperator, SearchColumnType, DatabaseType } from '@basesql/core';
import { PrismaExecutor } from '@basesql/prisma';

class UserQuery extends BaseSql {
  rawSQL() {
    return `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.created_at
      FROM users u
    `;
  }
  
  searchColumns() {
    return {
      'u.name': { op: SearchOperator.i_cont, type: SearchColumnType.string },
      'u.email': { op: SearchOperator.i_cont, type: SearchColumnType.string }
    };
  }
}

// Usage
const executor = new PrismaExecutor(prisma, DatabaseType.POSTGRESQL);
const result = await UserQuery.call(executor, {
  page: 1,
  perPage: 20,
  searchTerm: 'john'
});
```

## Advanced Query with Joins

```typescript
class UserWithOrdersQuery extends BaseSql {
  rawSQL() {
    return `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(o.id) as order_count,
        SUM(o.total) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
    `;
  }
  
  searchColumns() {
    return {
      'u.name': { op: SearchOperator.i_cont, type: SearchColumnType.string },
      'u.email': { op: SearchOperator.i_cont, type: SearchColumnType.string }
    };
  }
  
  groupBy() {
    return ['u.id', 'u.name', 'u.email'];
  }
  
  orderBy() {
    return {
      'total_spent': OrderByPropsEnum.desc
    };
  }
}
```

## Filtering Examples

### Single Filter

```typescript
const result = await UserQuery.call(executor, {
  filter: {
    status: {
      value: 'active',
      op: SearchOperator.eq,
      type: SearchColumnType.string
    }
  }
});
```

### Multiple Filters (AND)

```typescript
const result = await UserQuery.call(executor, {
  filter: {
    status: {
      value: 'active',
      op: SearchOperator.eq,
      type: SearchColumnType.string
    },
    age: {
      value: 18,
      op: SearchOperator.gteq,
      type: SearchColumnType.number
    }
  }
});
```

### Array Filters (OR on same field)

```typescript
const result = await UserQuery.call(executor, {
  filter: {
    status: [
      {
        value: 'active',
        op: SearchOperator.eq,
        type: SearchColumnType.string
      },
      {
        value: 'pending',
        op: SearchOperator.eq,
        type: SearchColumnType.string
      }
    ]
  }
});
```

### IN Operator

```typescript
const result = await UserQuery.call(executor, {
  filter: {
    role: {
      value: ['admin', 'moderator', 'user'],
      op: SearchOperator.in,
      type: SearchColumnType.string
    }
  }
});
```

## Search Operators Reference

### String Operators

```typescript
SearchOperator.eq          // Exact match: field = 'value'
SearchOperator.not_eq      // Not equal: field <> 'value'
SearchOperator.cont        // Contains: field LIKE '%value%'
SearchOperator.i_cont      // Case-insensitive contains: UPPER(field) LIKE UPPER('%value%')
SearchOperator.not_cont    // Does not contain
SearchOperator.not_i_cont  // Case-insensitive not contain
SearchOperator.start       // Starts with: field LIKE 'value%'
SearchOperator.not_start   // Does not start with
SearchOperator.end         // Ends with: field LIKE '%value'
SearchOperator.not_end     // Does not end with
SearchOperator.like        // SQL LIKE: field LIKE 'value'
SearchOperator.i_like      // Case-insensitive LIKE
```

### Numeric Operators

```typescript
SearchOperator.eq          // Equal: field = value
SearchOperator.not_eq      // Not equal: field <> value
SearchOperator.gt          // Greater than: field > value
SearchOperator.gteq        // Greater than or equal: field >= value
SearchOperator.lt          // Less than: field < value
SearchOperator.lteq        // Less than or equal: field <= value
```

### Array Operators

```typescript
SearchOperator.in          // In array: field IN (val1, val2, val3)
SearchOperator.not_in      // Not in array: field NOT IN (val1, val2, val3)
```

### Null Operators

```typescript
SearchOperator.null        // Is null: field IS NULL
SearchOperator.not_null    // Is not null: field IS NOT NULL
SearchOperator.empty       // Is null or empty: (field IS NULL OR field = ' ')
SearchOperator.not_empty   // Is not null and not empty
SearchOperator.blank       // Alias for empty
SearchOperator.present     // Alias for not_empty
```

### Boolean Operators

```typescript
SearchOperator.true        // field = true
SearchOperator.false       // field = false
```

## Composite Primary Keys

```typescript
class TenantUserQuery extends BaseSql {
  rawSQL() {
    return 'SELECT * FROM tenant_users';
  }
  
  primaryKeyField() {
    return ['tenant_id', 'user_id']; // Composite key
  }
}

// Fetch by composite key
const result = await TenantUserQuery.call(executor, {
  id: {
    tenant_id: 123,
    user_id: 456
  }
});
```

## Custom SQL Parameters

```typescript
class UserByRoleQuery extends BaseSql {
  rawSQL() {
    return `
      SELECT * FROM users 
      WHERE role = :roleParam 
      AND status = :statusParam
    `;
  }
  
  sqlParams() {
    return {
      roleParam: 'admin',
      statusParam: 'active'
    };
  }
}

// Or pass at runtime
const result = await UserByRoleQuery.call(executor, {
  sqlParams: {
    roleParam: 'moderator',
    statusParam: 'pending'
  }
});
```

## Pagination Without Results

```typescript
// Get only count without pagination
const result = await UserQuery.call(executor, {
  page: 0,
  perPage: 0
});

console.log(result.meta.totalRows); // Total count
console.log(result.records); // All records (no pagination)
```

## Database-Specific Features

### MySQL

```typescript
// Case-insensitive search uses UPPER()
searchColumns() {
  return {
    name: { op: SearchOperator.i_cont, type: SearchColumnType.string }
    // Generates: UPPER(name) LIKE UPPER('%:value%')
  };
}
```

### PostgreSQL

```typescript
// Case-insensitive search uses ILIKE
searchColumns() {
  return {
    name: { op: SearchOperator.i_cont, type: SearchColumnType.string }
    // Generates: name ILIKE '%:value%'
  };
}
```

### MSSQL

```typescript
// Case-insensitive search uses COLLATE
searchColumns() {
  return {
    name: { op: SearchOperator.i_cont, type: SearchColumnType.string }
    // Generates: name COLLATE Latin1_General_CI_AI LIKE '%:value%'
  };
}
```

## Type Safety

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

const result = await UserQuery.call<User>(executor, { page: 1 });

// result.records is typed as User[]
result.records.forEach(user => {
  console.log(user.name); // TypeScript knows this is a string
});
```

## Error Handling

```typescript
try {
  const result = await UserQuery.call(executor, params);
  return result;
} catch (error) {
  if (error.message.includes('primary key')) {
    // Handle composite key validation error
  }
  throw error;
}
```

## Performance Tips

1. **Use specific columns** instead of `SELECT *`
2. **Add indexes** on filtered/searched columns
3. **Limit search columns** to indexed fields
4. **Use appropriate operators** - `eq` is faster than `cont`
5. **Consider database-specific optimizations** in your raw SQL
