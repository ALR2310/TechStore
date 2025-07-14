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

export interface orderStatsResponse {
  totalOrder: number;
  orderByStatus: Record<string, number>;
  orderCount: [{ datetime: string; totalOrder: number; totalPrice: number }];
  orderRevenue: [{ label: string; value: number }];
}
