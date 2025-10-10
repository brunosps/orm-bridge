# @orm-bridge/sequelize

**Sequelize adapter for ORM Bridge** - Build complex SQL queries with pagination, search, and filtering for MySQL, PostgreSQL, and MSSQL.

---

## 🚀 Installation

```bash
npm install @orm-bridge/sequelize sequelize
```

**Peer Dependencies:**
- `sequelize` >= 6.0.0

---

## ⚡ Quick Start

```typescript
import { Sequelize } from 'sequelize';
import { BaseSql, SequelizeExecutor } from '@orm-bridge/sequelize';

// 1. Setup Sequelize
const sequelize = new Sequelize('mysql://user:pass@localhost:3306/mydb');
const executor = new SequelizeExecutor(sequelize);

// 2. Create your query class
class UserQuery extends BaseSql {
  rawSQL() {
    return `
      SELECT id, name, email, created_at
      FROM users
      WHERE status = 'active'
    `;
  }

  searchColumns() {
    return {
      name: { op: 'i_cont', type: 'string' },
      email: { op: 'i_cont', type: 'string' }
    };
  }

  primaryKeyField() {
    return ['id'];
  }
}

// 3. Execute query with pagination
const result = await UserQuery.call(executor, {
  page: 1,
  perPage: 20,
  searchTerm: 'john'
});

console.log(result.meta);     // { page: 1, perPage: 20, totalRows: 45, totalPages: 3 }
console.log(result.records);  // [{ id: 1, name: 'John...', ... }]
```

---

## 📚 Features

✅ **Automatic pagination** - No manual LIMIT/OFFSET  
✅ **Global search** - Search across multiple columns  
✅ **Advanced filtering** - 26+ operators (eq, like, in, gt, etc.)  
✅ **Database detection** - Auto-detects MySQL, PostgreSQL, MSSQL from Sequelize dialect  
✅ **Composite keys** - Support for multi-column primary keys  
✅ **Type-safe** - Full TypeScript support  

---

## 🔍 Search Operators

```typescript
import { SearchOperator } from '@orm-bridge/sequelize';

// Exact match
{ status: { value: 'active', op: SearchOperator.eq, type: 'string' } }

// Contains (case-insensitive)
{ name: { value: 'john', op: SearchOperator.i_cont, type: 'string' } }

// Greater than
{ age: { value: 18, op: SearchOperator.gt, type: 'number' } }

// In list
{ role: { value: ['admin', 'user'], op: SearchOperator.in, type: 'string' } }

// Null check
{ deleted_at: { op: SearchOperator.null, type: 'date' } }
```

**Available operators:**  
`eq`, `not_eq`, `cont`, `i_cont`, `like`, `i_like`, `gt`, `gteq`, `lt`, `lteq`, `in`, `not_in`, `null`, `not_null`, `empty`, `not_empty`, `blank`, `present`, `start`, `end`, `true`, `false`, and more.

---

## 📖 Full Documentation

- [Quickstart Guide](https://github.com/brunosps/orm-bridge/blob/main/QUICKSTART.md)
- [Complete Examples](https://github.com/brunosps/orm-bridge/blob/main/EXAMPLES.md)
- [API Reference](https://github.com/brunosps/orm-bridge)

---

## 🔄 Prisma Version

Looking for Prisma support? Check out **[@orm-bridge/prisma](https://www.npmjs.com/package/@orm-bridge/prisma)**

---

## 📝 License

MIT
