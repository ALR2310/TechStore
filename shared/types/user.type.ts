export interface getListUserPayload {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  role?: string;
  status?: string;
  dateOfBirth?: string;
  keyword?: string;
}
