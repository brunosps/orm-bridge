import { PrismaClient } from '@prisma/client';
import { DatabaseType, IQueryExecutor, ParameterStyle, TemplateEngine } from '@basesql/core';

export class PrismaExecutor implements IQueryExecutor {
  private databaseType: DatabaseType;
  private templateEngine: TemplateEngine;

  constructor(
    private readonly prisma: PrismaClient,
    databaseType?: DatabaseType,
  ) {
    // Prisma não expõe o tipo de banco facilmente, então precisa ser passado
    // ou detectado via configuração
    this.databaseType = databaseType ?? DatabaseType.POSTGRESQL;
    this.templateEngine = TemplateEngine.getInstance();
  }

  getDatabaseType(): DatabaseType {
    return this.databaseType;
  }

  async query<T>(sql: string, params: Record<string, any>): Promise<T[]> {
    // Prisma usa $queryRawUnsafe com parâmetros posicionais
    const { sql: convertedSql, params: convertedParams } = 
      this.templateEngine.convertParameterStyle(
        sql,
        params,
        ParameterStyle.POSITIONAL
      );

    // $queryRawUnsafe aceita SQL string e parâmetros como argumentos separados
    const result = await this.prisma.$queryRawUnsafe<T[]>(
      convertedSql,
      ...convertedParams
    );

    return result;
  }

  async queryOne<T>(sql: string, params: Record<string, any>): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  getParameterStyle(): ParameterStyle {
    // Prisma usa parâmetros posicionais ($1, $2, etc) para PostgreSQL
    // ou ? para MySQL
    switch (this.databaseType) {
      case DatabaseType.MYSQL:
        return ParameterStyle.QUESTION;
      case DatabaseType.POSTGRESQL:
        return ParameterStyle.POSITIONAL;
      case DatabaseType.MSSQL:
        return ParameterStyle.POSITIONAL;
      default:
        return ParameterStyle.POSITIONAL;
    }
  }
}
