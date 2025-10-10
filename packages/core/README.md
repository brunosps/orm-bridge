# @orm-bridge/core

**Core engine for ORM Bridge** - internal package containing ORM-agnostic SQL generation logic.

---

## ⚠️ Notice

This is an **internal package** used by ORM Bridge adapters. You should **not install this directly**.

Instead, install one of the adapter packages:

- **[@orm-bridge/sequelize](https://www.npmjs.com/package/@orm-bridge/sequelize)** - For Sequelize ORM
- **[@orm-bridge/prisma](https://www.npmjs.com/package/@orm-bridge/prisma)** - For Prisma ORM

---

## What's Inside

This package contains:

- **BaseSql** - Abstract base class for query building
- **Database-specific factories** - MySQL, PostgreSQL, MSSQL implementations
- **Search operators** - 26+ filter operators (eq, like, in, gt, etc.)
- **Pagination logic** - Database-agnostic pagination
- **Template engine** - Parameter style conversion

---

## Architecture

```
@orm-bridge/core (this package)
    ↓
    ├── @orm-bridge/sequelize → your app
    └── @orm-bridge/prisma → your app
```

---

## Documentation

See the main [ORM Bridge repository](https://github.com/brunosps/orm-bridge) for complete documentation.

---

## License

MIT
