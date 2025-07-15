import { baseQueryParams } from './params.type';

export interface getListReviewPayload extends baseQueryParams {
  status?: string;
  ratingFrom?: number;
  ratingTo?: number;
  product?: number;
  user?: number;
}

export interface reviewStatsResponse {
  totalReview: number;
  reviewCount: [{ label: string; value: number }];
  starCount: [{ label: string; value: number }];
  topProductReview: [{ datetime: string; productName: string; count: number }];
  topReviewer: [{ label: string; value: number }];
  lowRatingProduct: [{ productName: string; ratingCount: number }];
}
