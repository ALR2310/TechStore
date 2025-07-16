import { baseQueryParams } from './params.type';

export interface getListProductParams extends baseQueryParams {
  status?: string;
  category?: string;
  brand?: string;
  quantityFrom?: number;
  quantityTo?: number;
  priceFrom?: number;
  priceTo?: number;
}

export interface createProductPayload {
  name?: string;
  slug?: string;
  category?: string;
  brand?: string;
  series?: string;
  image?: File;
  quantity?: number;
  price?: number;
  discount?: number;
  status?: string;
  content?: string;
  deviceConfigs: string;
}

export interface updateProductPayload extends createProductPayload {
  id: string;
}

export interface productStatsResponse {
  totalProduct: number;
  productByStatus: {
    Active: [{ id: number; name: string }];
    Inactive: [{ id: number; name: string }];
  };
  bestSellingProducts: [{ datetime: string; name: string; slug: string; price: number; totalSold: number }];
  countByCategory: [{ label: string; value: number }];
}
