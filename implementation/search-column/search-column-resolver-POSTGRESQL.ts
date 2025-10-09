import { SearchOperator, SearchColumnType } from '@core/sql/types';
import { SearchColumnBase } from './search-column-resolver';

export class SearchColumnResolverPOSTGRESQL extends SearchColumnBase {
  getFormatValue() {
    switch (this.operator) {
      case SearchOperator[SearchOperator.cont]:
      case SearchOperator[SearchOperator.i_cont]:
      case SearchOperator[SearchOperator.not_cont]:
      case SearchOperator[SearchOperator.not_i_cont]:
        return `\%${this.searchedValue}\%`;
      case SearchOperator[SearchOperator.end]:
      case SearchOperator[SearchOperator.not_end]:
        return `\%${this.searchedValue}`;
      case SearchOperator[SearchOperator.start]:
      case SearchOperator[SearchOperator.not_start]:
        return `${this.searchedValue}\%`;
      case SearchOperator[SearchOperator.false]:
        return false;
      case SearchOperator[SearchOperator.true]:
        return true;
      case SearchOperator[SearchOperator.in]:
      case SearchOperator[SearchOperator.not_in]:
        if (typeof this.searchedValue === 'string') {
          this.searchedValue = this.searchedValue.split(',');
        }
        const processedValues = this.searchedValue.map((value) => value);
        return processedValues;
      default:
        switch (this.type) {
          case SearchColumnType.number:
            return Number.isNaN(parseInt(this.searchedValue))
              ? 0
              : parseInt(this.searchedValue);
          case SearchColumnType.float:
            return Number.isNaN(parseFloat(this.searchedValue))
              ? 0.0
              : parseFloat(this.searchedValue);
          default:
            return this.searchedValue;
        }
    }
  }

  blank(): string {
    return this.empty();
  }

  cont(): string {
    return this.like();
  }

  empty(): string {
    return `(${this.null()} OR ${this.columnName} = ' ')`;
  }

  end(): string {
    return this.like();
  }

  eq(): string {
    return `${this.columnName} = :${this.formatName()}`;
  }

  false(): string {
    return this.eq();
  }

  gt(): string {
    return `${this.columnName} > :${this.formatName()}`;
  }

  gteq(): string {
    return `${this.columnName} >= :${this.formatName()}`;
  }

  i_cont(): string {
    return this.i_like();
  }

  i_like(): string {
    return `${this.columnName} ILIKE :${this.formatName()}`;
  }

  in(): string {
    return `${this.columnName} IN (:${this.formatName()})`;
  }

  like(): string {
    return `${this.columnName} LIKE :${this.formatName()}`;
  }

  lt(): string {
    return `${this.columnName} < :${this.formatName()}`;
  }

  lteq(): string {
    return `${this.columnName} <= :${this.formatName()}`;
  }

  matches(): string {
    return this.like();
  }

  not_cont(): string {
    return `NOT (${this.cont()})`;
  }

  not_empty(): string {
    return `(${this.not_null()} OR ${this.columnName} <> ' ')`;
  }

  not_end(): string {
    return `NOT (${this.end()})`;
  }

  not_eq(): string {
    return `${this.columnName} <> :${this.formatName()}`;
  }

  not_i_cont(): string {
    return `NOT (${this.i_cont()})`;
  }

  not_in(): string {
    return `NOT (${this.in()})`;
  }

  not_null(): string {
    return `${this.columnName} IS NOT NULL`;
  }

  not_start(): string {
    return `NOT (${this.start()})`;
  }

  null(): string {
    return `${this.columnName} IS NULL`;
  }

  present(): string {
    return this.not_empty();
  }

  start(): string {
    return this.like();
  }

  true(): string {
    return this.eq();
  }
}
