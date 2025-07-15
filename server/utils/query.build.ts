export function buildDateFilter(start?: string, end?: string, alias?: string): { query: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  const col = alias ? `${alias}.createdAt` : 'createdAt';

  if (start) {
    conditions.push(`date(${col}) >= date(?)`);
    params.push(start);
  }

  if (end) {
    conditions.push(`date(${col}) <= date(?)`);
    params.push(end);
  }

  const query = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return { query, params };
}
