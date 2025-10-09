export enum DatabaseType {
  MSSQL,
  POSTGRESQL,
  MYSQL,
}

export enum OrderByPropsEnum {
  asc,
  desc,
}

export type OrderByProps = {
  [x: string]: OrderByPropsEnum;
};

export type SqlParamsProps = {
  [x: string]: any;
};

export enum SearchOperator {
  not_eq,
  not_empty,
  not_null,
  not_in,
  not_start,
  not_end,
  not_cont,
  not_i_cont,
  i_like,
  i_cont,
  eq,
  matches,
  like,
  lt,
  lteq,
  gt,
  gteq,
  empty,
  present,
  blank,
  null,
  in,
  start,
  end,
  cont,
  true,
  false,
}

export type FilterCond = {
  op: SearchOperator;
  value: any;
  type: SearchColumnType;
};

export type FilterProps = {
  [x: string]: FilterCond | FilterCond[];
};

export enum SearchColumnType {
  date,
  float,
  string,
  number,
}

export type SearchColumnsProps = {
  [x: string]: {
    op: SearchOperator;
    type: SearchColumnType;
  };
};

export type SqlParams = {
  query?: string;
  searchColumns?: SearchColumnsProps;
  primaryKeyField?: string | string[];
  page?: number;
  perPage?: number;
  searchTerm?: string;
  filter?: FilterProps;
  sqlParams?: SqlParamsProps;
  order?: OrderByProps;
  groupBy?: Array<string>;
  id?: string | number | { [x: string]: string | number };
};

export type SqlReturns = {
  query: string;
  queryCount: string;
  params: {
    [x: string]: any;
  };
};

export interface IPaginator {
  getPaginationClause(page: number, perPage: number): string;
}

export type ListOfRecords<T> = {
  meta: {
    page: number;
    perPage: number;
    totalPages: number;
    totalRows: number;
  };
  records: T[];
};

// New interfaces for ORM abstraction
export interface IQueryExecutor {
  query<T>(sql: string, params: Record<string, any>): Promise<T[]>;
  queryOne<T>(sql: string, params: Record<string, any>): Promise<T | null>;
  getDatabaseType(): DatabaseType;
}

export enum ParameterStyle {
  NAMED,      // :param (Sequelize style)
  POSITIONAL, // $1, $2 (Prisma/PostgreSQL style)
  QUESTION,   // ? (MySQL style)
}
