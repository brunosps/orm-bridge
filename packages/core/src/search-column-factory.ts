import { SearchColumnBase } from './search-column/search-column-resolver';
import { SearchColumnResolverMSSQL } from './search-column/search-column-resolver-MSSQL';
import { SearchColumnResolverMYSQL } from './search-column/search-column-resolver-MYSQL';
import { SearchColumnResolverPOSTGRESQL } from './search-column/search-column-resolver-POSTGRESQL';
import { DatabaseType, SearchColumnType, SearchOperator } from './types';

export class SearchColumnFactory {
  resolver: SearchColumnBase;

  constructor(
    columnName: string,
    type: SearchColumnType,
    operator: SearchOperator,
    searchedValue: any,
    databaseType: DatabaseType = DatabaseType.MYSQL,
  ) {
    switch (databaseType) {
      case DatabaseType.MSSQL:
        this.resolver = new SearchColumnResolverMSSQL(
          columnName,
          type,
          SearchOperator[operator],
          searchedValue,
        );
        break;
      case DatabaseType.POSTGRESQL:
        this.resolver = new SearchColumnResolverPOSTGRESQL(
          columnName,
          type,
          SearchOperator[operator],
          searchedValue,
        );
        break;
      case DatabaseType.MYSQL:
        this.resolver = new SearchColumnResolverMYSQL(
          columnName,
          type,
          SearchOperator[operator],
          searchedValue,
        );
        break;
      default:
        throw new Error(`Not supported database ${databaseType}`);
    }
  }

  toString(): string {
    return this.resolver.format();
  }

  formatName(): string {
    return this.resolver.formatName();
  }

  formatValue(): any {
    return this.resolver.getFormatValue();
  }
}
