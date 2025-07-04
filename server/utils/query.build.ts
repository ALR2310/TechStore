export function buildDateFilter(start?: string, end?: string): { query: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  if (start) {
    conditions.push(`date(createdAt) >= date(?)`);
    params.push(start);
  }

  if (end) {
    conditions.push(`date(createdAt) <= date(?)`);
    params.push(end);
  }

  const query = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return { query, params };
}
