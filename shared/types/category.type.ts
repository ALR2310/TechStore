export interface createCategoryPayload {
  name: string;
  slug: string;
  status?: 'Active' | 'Inactive';
}

export interface updateCategoryPayload extends createCategoryPayload {
  id: string;
}
