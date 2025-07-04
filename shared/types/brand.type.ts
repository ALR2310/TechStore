export interface createBrandPayload {
  name: string;
  status: 'Active' | 'Inactive';
  series?: {
    id?: string;
    name: string;
    status: 'Active' | 'Inactive';
  }[];
}

export interface updateBrandPayload extends createBrandPayload {
  id: string;
  idsDelete?: string[];
}
