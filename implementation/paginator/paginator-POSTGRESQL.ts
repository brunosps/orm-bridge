import { IPaginator } from '@core/sql/types';

export class PaginatorPOSTGRESQL implements IPaginator {
  getPaginationClause(page: number, perPage: number): string {
    const initialValue = (page - 1) * perPage;
    return `LIMIT ${perPage} OFFSET ${initialValue}`;
  }
}
