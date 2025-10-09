import { IPaginator } from '@core/sql/types';

export class PaginatorMSSQL implements IPaginator {
  getPaginationClause(page: number, perPage: number): string {
    const initialValue = (page - 1) * perPage;
    return `OFFSET ${initialValue} ROWS FETCH NEXT ${perPage} ROWS ONLY`;
  }
}
