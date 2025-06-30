import { baseQueryParams } from './params.type';

export interface getListReviewPayload extends baseQueryParams {
  status?: string;
  ratingFrom?: number;
  ratingTo?: number;
  product?: number;
  user?: number;
}
