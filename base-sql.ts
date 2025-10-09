import { ListOfRecords } from '@core/base/types';
import { QueryTypes, Sequelize } from 'sequelize';

import { AbstractSql } from './abstract-sql';
import { PaginatorFactory } from './paginator-factory';
import { SearchColumnFactory } from './search-column-factory';
import { RawSQL } from './sqlraw';
import {
  DatabaseType,
  FilterProps,
  OrderByProps,
  OrderByPropsEnum,
  SearchColumnsProps,
  SearchColumnType,
  SearchOperator,
  SqlParams,
  SqlParamsProps,
  SqlReturns,
} from './types';

export class BaseSql extends RawSQL implements AbstractSql {
  private _paginator: PaginatorFactory;
  public get paginator() {
    return this._paginator;
  }

  public set paginator(value: PaginatorFactory) {
    this._paginator = value;
  }

  constructor(
    private readonly databaseType: DatabaseType = DatabaseType.MYSQL,
  ) {
    super();
    this.paginator = new PaginatorFactory(databaseType);
  }

  static async call<Q extends object>(
    sequelizeInstance: Sequelize,
    sqlParams: SqlParams,
  ): Promise<ListOfRecords<Q>> {
    const instance = new this();

    const { query, params, queryCount } = instance.call(sqlParams);

    const [count] = await sequelizeInstance.query<{ TOTALROWS: number }>(
      queryCount,
      {
        type: QueryTypes.SELECT,
        replacements: params,
        raw: true,
        retry: {
          max: 2,
          // timeout: 1000 * 20,
        },
      },
    );

    const records = await sequelizeInstance.query<Q>(query, {
      type: QueryTypes.SELECT,
      replacements: params,
      raw: true,
      retry: {
        max: 2,
        // timeout: 1000 * 20,
      },
    });

    const meta = instance.calcMetadata(
      sqlParams.page,
      sqlParams.perPage,
      count.TOTALROWS,
    );

    return {
      meta,
      records,
    };
  }

  primaryKeyField(): string | string[] {
    return 'id';
  }

  groupBy(): string[] {
    return [];
  }

  sqlParams(): SqlParamsProps {
    return {};
  }

  call(params: SqlParams): SqlReturns {
    const {
      query,
      searchColumns,
      sqlParams,
      groupBy,
      perPage,
      order,
      page,
      searchTerm,
      filter,
    } = this.getDefaultParams(params);

    const { whereClause, whereParams } = this.getWhereClause(
      searchColumns,
      searchTerm,
      filter,
      query.toUpperCase().includes('WHERE'),
    );

    const groupByClause = this.getGroupByClause(groupBy);
    const orderByClause = this.getOrderByClause(order);
    const paginationClause = this.paginator.getPaginationClause(page, perPage);

    return {
      query: [
        query,
        whereClause,
        groupByClause,
        orderByClause,
        paginationClause,
      ]
        .filter((x) => x !== '')
        .join(' '),
      queryCount: this.getQueryCount([query, whereClause, groupByClause]),
      params: { ...whereParams, ...sqlParams },
    };
  }

  searchColumns(): SearchColumnsProps {
    return {};
  }

  perPage(): number {
    return 50;
  }

  orderBy(): OrderByProps {
    return {};
  }

  calcMetadata(page, perPage, totalRows) {
    if (page === 0 || perPage === 0) {
      return {
        page: 0,
        perPage: 0,
        totalPages: 1,
        totalRows,
      };
    }

    const intTotalPages = Math.trunc(totalRows / perPage);
    const aditionalPage = totalRows / perPage - intTotalPages > 0 ? 1 : 0;

    return {
      page,
      perPage,
      totalRows,
      totalPages: intTotalPages + aditionalPage,
    };
  }

  private getQueryCount(clauses: string[]): string {
    const internalQuery = clauses.filter((x) => x !== '').join(' ');
    return `SELECT COUNT(*) TOTALROWS FROM (${internalQuery}) TABCOUNT`;
  }

  private getOrderByClause(order: OrderByProps): string {
    if (Object.entries(order).length === 0) {
      return '';
    }
    const orderByClause = Object.entries(order).map(([k, v]) => {
      return `${k} ${OrderByPropsEnum[v]}`;
    });

    return `ORDER BY ${orderByClause.join(', ')}`;
  }

  private getGroupByClause(groupBy: Array<string>): string {
    if (groupBy.length == 0) {
      return '';
    }

    return `GROUP BY ${groupBy.join(', ')}`;
  }

  private getWhereClause(
    searchColumns: SearchColumnsProps,
    searchTerm: string,
    filter: FilterProps,
    hasWhereWord: boolean,
  ): { whereClause: string; whereParams: { [x: string]: string } } {
    const columnsFromFilter = Object.entries(filter)
      .map(([k, v]) =>
        (Array.isArray(v) ? v : [v]).map(
          (f) =>
            new SearchColumnFactory(
              k,
              f.value,
              f.op,
              f.value,
              this.databaseType,
            ),
        ),
      )
      .reduce((acc, val) => [...acc, ...val], []);

    const columnsFromSearch = Object.entries(searchColumns).map(
      ([k, v]) =>
        new SearchColumnFactory(k, v.type, v.op, searchTerm, this.databaseType),
    );
    const whereClause = [
      columnsFromFilter.map((f) => f.toString()).join(' AND '),
      searchTerm === ''
        ? ''
        : `(${columnsFromSearch.map((f) => f.toString()).join(' OR ')})`,
    ]
      .filter((s) => s !== '')
      .join(' AND ');

    if (whereClause === '') {
      return { whereClause: '', whereParams: {} };
    }

    const whereParams = [
      ...this.excludeOperators(columnsFromFilter),
      ...this.excludeOperators(columnsFromSearch),
    ].reduce((prev, curr, index) => {
      return {
        ...prev,
        [curr.formatName()]: curr.formatValue(),
      };
    }, {});

    return {
      whereClause: `${hasWhereWord ? ' AND ' : ' WHERE '}${whereClause}`,
      whereParams: whereParams,
    };
  }

  private excludeOperators(
    searchColumns: SearchColumnFactory[],
  ): SearchColumnFactory[] {
    const excludeOp = [
      SearchOperator.blank,
      SearchOperator.empty,
      SearchOperator.not_empty,
      SearchOperator.not_null,
      SearchOperator.null,
      SearchOperator.present,
    ];

    return searchColumns.filter(
      (col) => !excludeOp.includes(SearchOperator[col.resolver.operator]),
    );
  }

  private getDefaultParams(params: SqlParams): SqlParams {
    return {
      query: this.rawSQL().replace(/[\r\n\t]/gm, ''),
      searchColumns: this.searchColumns(),
      primaryKeyField: this.primaryKeyField(),
      sqlParams: this.sqlParams(),
      groupBy: this.groupBy(),
      perPage: this.perPage(),
      order: this.orderBy(),
      page: 1,
      searchTerm: '',
      filter: {},
      ...params,
      ...this.getPrimaryKeyValues(params),
    };
  }

  private getPrimaryKeyValues(params: SqlParams): {
    filter?: FilterProps;
    searchColumns?: SearchColumnsProps;
    searchTerm?: string;
  } {
    const { id } = params;
    const pkFields = this.getArrValue(this.primaryKeyField());
    const result = {
      filter: {},
      searchTerm: '',
      searchColumns: {},
      page: 0,
      perPage: 0,
    };

    if (!id || pkFields.length === 0) {
      return {};
    }

    if (typeof id === 'object' || pkFields.length > 1) {
      return {
        ...result,
        filter: this.getPKValuesFromObject(Object(id), pkFields),
      };
    }

    return {
      ...result,
      filter: {
        [pkFields[0] as string]: {
          value: id,
          op: SearchOperator.eq,
          type:
            typeof id === 'string'
              ? SearchColumnType.string
              : SearchColumnType.number,
        },
      },
    };
  }

  private getPKValuesFromObject(
    ids: {
      [x: string]: string | number;
    },
    pkFields: string[],
  ): FilterProps {
    const filterValue = Object.entries(ids).reduce((prev, curr, index) => {
      if (!pkFields.includes(curr[0])) {
        return prev;
      }

      return {
        ...prev,
        [curr[0]]: {
          value: curr[1],
          op: SearchOperator.eq,
          type:
            typeof curr[1] === 'string'
              ? SearchColumnType.string
              : SearchColumnType.number,
        },
      };
    }, {});

    if (Object.keys(filterValue).length !== pkFields.length) {
      throw new Error(
        'The filter for a primary key should have an equal number of fields as the key itself.',
      );
    }

    return filterValue;
  }

  private getArrValue(value: string | string[]): string[] {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }
}
