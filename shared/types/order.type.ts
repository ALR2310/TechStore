import { baseQueryParams } from './params.type';

export interface getListOrderParams extends baseQueryParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priceFrom?: number;
  priceTo?: number;
}

export interface approveOrderParams {
  id: string;
  status: string;
}
