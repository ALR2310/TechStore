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
