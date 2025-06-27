import { baseQueryParams } from './params.type';

export interface getListOrderParams extends baseQueryParams {
  dateFrom?: string;
  dateTo?: string;
  priceFrom?: number;
  priceTo?: number;
}
