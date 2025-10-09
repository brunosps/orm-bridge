import { QueryTypes, Sequelize } from 'sequelize';
import { DatabaseType, IQueryExecutor, ParameterStyle } from '@basesql/core';

export class SequelizeExecutor implements IQueryExecutor {
  private databaseType: DatabaseType;

  constructor(private readonly sequelize: Sequelize) {
    // Detectar tipo de banco baseado no dialect do Sequelize
    const dialect = sequelize.getDialect();
    switch (dialect) {
      case 'mysql':
      case 'mariadb':
        this.databaseType = DatabaseType.MYSQL;
        break;
      case 'postgres':
        this.databaseType = DatabaseType.POSTGRESQL;
        break;
      case 'mssql':
        this.databaseType = DatabaseType.MSSQL;
        break;
      default:
        throw new Error(`Unsupported Sequelize dialect: ${dialect}`);
    }
  }

  getDatabaseType(): DatabaseType {
    return this.databaseType;
  }

  async query<T>(sql: string, params: Record<string, any>): Promise<T[]> {
    return await this.sequelize.query<T>(sql, {
      type: QueryTypes.SELECT,
      replacements: params,
      raw: true,
      retry: {
        max: 2,
      },
    });
  }

  async queryOne<T>(sql: string, params: Record<string, any>): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  getParameterStyle(): ParameterStyle {
    // Sequelize usa named parameters (:param)
    return ParameterStyle.NAMED;
  }
}
