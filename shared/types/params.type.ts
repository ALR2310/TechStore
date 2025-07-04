export interface baseQueryParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface getStatisticPayload {
  by: 'day' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}
