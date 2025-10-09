import { PaginatorMSSQL } from './paginator/paginator-MSSQL';
import { PaginatorMYSQL } from './paginator/paginator-MYSQL';
import { PaginatorPOSTGRESQL } from './paginator/paginator-POSTGRESQL';
import { DatabaseType, IPaginator } from './types';

export class PaginatorFactory {
  resolver: IPaginator;

  constructor(databaseType: DatabaseType) {
    switch (databaseType) {
      case DatabaseType.MSSQL:
        this.resolver = new PaginatorMSSQL();
        break;
      case DatabaseType.POSTGRESQL:
        this.resolver = new PaginatorPOSTGRESQL();
        break;
      case DatabaseType.MYSQL:
        this.resolver = new PaginatorMYSQL();
        break;
      default:
        throw new Error(`Not supported database ${databaseType}`);
    }
  }

  getPaginationClause(page: number, perPage: number): string {
    if (page == 0 || perPage == 0) {
      return '';
    }
    return this.resolver.getPaginationClause(page, perPage);
  }
}
