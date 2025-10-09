import { SearchColumnType } from '../types';

interface ISearchColumnResolver {
  blank(): string;
  cont(): string;
  empty(): string;
  end(): string;
  eq(): string;
  false(): string;
  gt(): string;
  gteq(): string;
  i_cont(): string;
  i_like(): string;
  in(): string;
  like(): string;
  lt(): string;
  lteq(): string;
  matches(): string;
  not_cont(): string;
  not_empty(): string;
  not_end(): string;
  not_eq(): string;
  not_i_cont(): string;
  not_in(): string;
  not_null(): string;
  not_start(): string;
  null(): string;
  present(): string;
  start(): string;
  true(): string;
}

export abstract class SearchColumnBase implements ISearchColumnResolver {
  public _type!: SearchColumnType;
  public get type() {
    return this._type;
  }

  public set type(value: SearchColumnType) {
    this._type = value;
  }

  public _columnName!: string;
  public get columnName() {
    return this._columnName;
  }

  public set columnName(value: string) {
    this._columnName = value;
  }

  public _operator!: string;
  public get operator() {
    return this._operator;
  }

  public set operator(value: string) {
    this._operator = value;
  }

  public _searchedValue!: any;
  public get searchedValue() {
    return this._searchedValue;
  }

  public set searchedValue(value: any) {
    this._searchedValue = value;
  }

  constructor(
    columnName: string,
    type: SearchColumnType,
    operator: string,
    searchedValue: any,
  ) {
    this.columnName = columnName;
    this.type = type;
    this.operator = operator;
    this.searchedValue = searchedValue;
  }

  abstract blank(): string;
  abstract cont(): string;
  abstract empty(): string;
  abstract end(): string;
  abstract eq(): string;
  abstract false(): string;
  abstract gt(): string;
  abstract gteq(): string;
  abstract i_cont(): string;
  abstract i_like(): string;
  abstract in(): string;
  abstract like(): string;
  abstract lt(): string;
  abstract lteq(): string;
  abstract matches(): string;
  abstract not_cont(): string;
  abstract not_empty(): string;
  abstract not_end(): string;
  abstract not_eq(): string;
  abstract not_i_cont(): string;
  abstract not_in(): string;
  abstract not_null(): string;
  abstract not_start(): string;
  abstract null(): string;
  abstract present(): string;
  abstract start(): string;
  abstract true(): string;

  abstract getFormatValue(): any;

  format(): string {
    const potentialMethod = (this as any)[this.operator]?.bind(this);
    if (typeof potentialMethod !== 'function') {
      return '';
    }
    return potentialMethod(this.columnName, this.searchedValue);
  }

  formatName(): string {
    return `${this.columnName
      .replace(/\./g, '_')
      .replace(/\(/g, '_')
      .replace(/\)/g, '_')}_${this.operator}`;
  }
}
