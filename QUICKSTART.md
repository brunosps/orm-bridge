# 🚀 Quick Start Guide

## Para desenvolvedores que querem usar esta lib

### Opção 1: Setup Rápido (Recomendado)

```bash
# Clone o repositório
git clone <repo-url>
cd basesql-sequelize

# Execute o script de setup
./setup.sh
```

Isso vai:
- ✅ Instalar todas as dependências
- ✅ Compilar todos os pacotes
- ✅ Deixar tudo pronto para usar

### Opção 2: Manual

```bash
# Instalar dependências
npm install

# Compilar todos os pacotes
npm run build
```

## Como usar no seu projeto

### Com Sequelize

```bash
# No diretório do SEU projeto
npm link /caminho/para/basesql-sequelize/packages/core
npm link /caminho/para/basesql-sequelize/packages/sequelize
```

Depois, no seu código:

```typescript
import { BaseSql, SearchOperator, SearchColumnType } from '@basesql/core';
import { SequelizeExecutor } from '@basesql/sequelize';

class MinhaQuery extends BaseSql {
  rawSQL() {
    return 'SELECT * FROM usuarios';
  }
  
  searchColumns() {
    return {
      nome: { op: SearchOperator.i_cont, type: SearchColumnType.string }
    };
  }
}

// Usar
const executor = new SequelizeExecutor(sequelizeInstance);
const resultado = await MinhaQuery.call(executor, {
  page: 1,
  perPage: 20,
  searchTerm: 'bruno'
});

console.log(resultado.meta);     // { page: 1, perPage: 20, totalRows: 50, totalPages: 3 }
console.log(resultado.records);  // Array com os registros
```

### Com Prisma

```bash
# No diretório do SEU projeto
npm link /caminho/para/basesql-sequelize/packages/core
npm link /caminho/para/basesql-sequelize/packages/prisma
```

Depois, no seu código:

```typescript
import { BaseSql, SearchOperator, SearchColumnType, DatabaseType } from '@basesql/core';
import { PrismaExecutor } from '@basesql/prisma';

class MinhaQuery extends BaseSql {
  rawSQL() {
    return 'SELECT * FROM usuarios';
  }
  
  searchColumns() {
    return {
      nome: { op: SearchOperator.i_cont, type: SearchColumnType.string }
    };
  }
}

// Usar
const executor = new PrismaExecutor(prismaClient, DatabaseType.POSTGRESQL);
const resultado = await MinhaQuery.call(executor, {
  page: 1,
  perPage: 20,
  searchTerm: 'bruno'
});
```

## Scripts Disponíveis

```bash
# Compilar tudo
npm run build

# Compilar apenas o core
npm run build:core

# Compilar apenas sequelize
npm run build:sequelize

# Compilar apenas prisma
npm run build:prisma

# Limpar compilados
npm run clean:dist

# Limpar tudo (inclusive node_modules)
npm run clean
```

## Estrutura do Projeto

```
basesql-sequelize/
├── packages/
│   ├── core/          → @basesql/core (lógica SQL)
│   ├── sequelize/     → @basesql/sequelize (adapter)
│   └── prisma/        → @basesql/prisma (adapter)
├── EXAMPLES.md        → Exemplos de uso
├── MIGRATION.md       → Guia de migração
├── DEVELOPMENT.md     → Guia para desenvolvedores
└── setup.sh           → Script de instalação
```

## Principais Features

✅ **Multi-Database**: MySQL, PostgreSQL, MSSQL  
✅ **Multi-ORM**: Sequelize e Prisma  
✅ **26+ Operadores**: `eq`, `cont`, `i_cont`, `gt`, `lteq`, `in`, `null`, etc  
✅ **Paginação Automática**: Com metadados  
✅ **Busca Global**: Busca em múltiplas colunas  
✅ **Filtros Avançados**: AND, OR, compostos  
✅ **Type-Safe**: TypeScript completo  
✅ **Zero SQL Injection**: Parâmetros sempre escapados  

## Documentação

- **[README.md](README.md)** - Visão geral e instalação
- **[EXAMPLES.md](EXAMPLES.md)** - Exemplos práticos de uso
- **[MIGRATION.md](MIGRATION.md)** - Migração da versão antiga
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Guia para contribuidores
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Instruções para IA

## Perguntas Frequentes

### Como sei qual DatabaseType usar com Prisma?

Depende do seu banco:
- `DatabaseType.POSTGRESQL` - PostgreSQL
- `DatabaseType.MYSQL` - MySQL/MariaDB
- `DatabaseType.MSSQL` - SQL Server

### Preciso instalar Sequelize E Prisma?

**Não!** Instale apenas o que você usa:
- Se usa Sequelize: `@basesql/core` + `@basesql/sequelize`
- Se usa Prisma: `@basesql/core` + `@basesql/prisma`

### Como faço queries customizadas?

Estenda `BaseSql` e implemente `rawSQL()`:

```typescript
class MinhaQueryCustom extends BaseSql {
  rawSQL() {
    return `
      SELECT u.*, COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id
    `;
  }
  
  groupBy() {
    return ['u.id'];
  }
}
```

### Como faço JOIN?

Coloque o JOIN direto no `rawSQL()`:

```typescript
rawSQL() {
  return `
    SELECT u.*, r.name as role_name
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
  `;
}
```

### A paginação é automática?

**Sim!** Você só passa `page` e `perPage`, o resto é automático:

```typescript
const resultado = await Query.call(executor, {
  page: 2,
  perPage: 25
});
// Gera automaticamente: LIMIT 25 OFFSET 25 (MySQL/PostgreSQL)
// Ou: OFFSET 25 ROWS FETCH NEXT 25 ROWS ONLY (MSSQL)
```

## Suporte

Algo não funcionou? Verifique:
1. ✅ Executou `./setup.sh` ou `npm install && npm run build`?
2. ✅ Os pacotes estão linkados no seu projeto?
3. ✅ Viu os exemplos em [EXAMPLES.md](EXAMPLES.md)?
4. ✅ Leu o guia de desenvolvimento em [DEVELOPMENT.md](DEVELOPMENT.md)?
