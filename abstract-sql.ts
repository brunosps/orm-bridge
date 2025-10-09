import { OrderByProps, SearchColumnsProps, SqlParamsProps } from './types';

export abstract class AbstractSql {
  static call() {
    throw new Error('Method not implemented.');
  }

  abstract primaryKeyField(): string | string[];

  abstract searchColumns(): SearchColumnsProps;

  abstract groupBy(): Array<string>;

  abstract sqlParams(): SqlParamsProps;

  abstract orderBy(): OrderByProps;

  abstract perPage(): number;
}
