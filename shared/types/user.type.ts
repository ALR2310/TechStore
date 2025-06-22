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

export interface updateUserPayload {
  id: string;
  email?: string;
  role?: string;
  status?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}